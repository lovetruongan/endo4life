package com.endo4life.service.user;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.endo4life.web.rest.model.CreateUserRequestDto;
import com.endo4life.web.rest.model.InviteUserRequestDto;
import com.endo4life.web.rest.model.UpdateUserRequestDto;
import com.endo4life.web.rest.model.UserInfoCriteria;
import com.endo4life.web.rest.model.UserResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.constant.Constants;
import com.endo4life.domain.document.UserInfo;
import com.endo4life.domain.document.UserInfo.UserInfoRole;
import com.endo4life.domain.document.UserInfo.UserInfoState;
import com.endo4life.mapper.UserInfoMapper;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.repository.specifications.UserInfoSpecifications;
import com.endo4life.security.UserContextHolder;
import com.endo4life.service.keycloak.KeycloakService;
import com.endo4life.service.minio.MinioService;
import com.endo4life.service.minio.MinioProperties;
import com.endo4life.utils.StringUtil;
import com.endo4life.web.rest.errors.BadRequestException;
import com.endo4life.web.rest.errors.UserAlreadyExistsException;
import com.endo4life.web.rest.errors.UserNotFoundException;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserInfoServiceImpl implements UserInfoService {

    private final UserInfoRepository userInfoRepository;
    private final UserInfoMapper userInfoMapper;
    private final KeycloakService keycloakService;
    private final MinioService minioService;
    private final MinioProperties minioProperties;

    @Override
    public UUID createUser(CreateUserRequestDto createUserRequestDto) {
        validateCreateUserRequest(createUserRequestDto);

        // Check if user already exists in our database
        if (checkExistEmail(createUserRequestDto.getEmail())) {
            throw new UserAlreadyExistsException(
                    "User with email " + createUserRequestDto.getEmail() + " already exists");
        }

        // Create user in Keycloak first
        UUID userId = keycloakService.createUserInKeycloak(
                createUserRequestDto.getEmail(),
                createUserRequestDto.getFirstName(),
                createUserRequestDto.getLastName(),
                createUserRequestDto.getRole().getValue(),
                createUserRequestDto.getPassword());

        // Create user in our database
        UserInfo userInfo = userInfoMapper.toUserInfo(createUserRequestDto);
        userInfo.setUserId(userId);
        userInfo.setCreatedAt(LocalDateTime.now());
        userInfo.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

        // Handle avatar (object key from presigned URL upload)
        if (createUserRequestDto.getAvatar() != null) {
            userInfo.setAvatarPath(createUserRequestDto.getAvatar().toString());
        }

        // Handle certificates (object keys from presigned URL uploads)
        if (CollectionUtils.isNotEmpty(createUserRequestDto.getCertificates())) {
            Set<String> certificatePaths = createUserRequestDto.getCertificates().stream()
                    .map(UUID::toString)
                    .collect(Collectors.toSet());
            userInfo.setCertificatePath(certificatePaths);
        }

        userInfoRepository.save(userInfo);

        return userInfo.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UUID inviteUser(InviteUserRequestDto requestDto) {
        if (!validateEmail(requestDto.getEmail())) {
            throw new BadRequestException("Invalid email format");
        }

        if (checkExistEmail(requestDto.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + requestDto.getEmail() + " already exists");
        }

        UUID keycloakUserId = null;
        try {
            // Create user in Keycloak first
            keycloakUserId = keycloakService.inviteUserInKeycloak(
                    requestDto.getEmail(),
                    requestDto.getFirstName(),
                    requestDto.getLastName(),
                    requestDto.getRole().getValue());

            // Create user in our database
            UserInfo userInfo = userInfoMapper.toUserInfo(requestDto);
            userInfo.setUserId(keycloakUserId);
            userInfo.setState(UserInfoState.PENDING);
            userInfo.setCreatedAt(LocalDateTime.now());
            userInfo.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
            userInfoRepository.save(userInfo);

            return userInfo.getId();
        } catch (Exception e) {
            // If database save fails, try to delete the user from Keycloak
            if (keycloakUserId != null) {
                try {
                    log.warn("Database save failed, attempting to rollback Keycloak user: {}", keycloakUserId);
                    keycloakService.deleteUserFromKeycloak(keycloakUserId);
                    log.info("Successfully rolled back Keycloak user creation");
                } catch (Exception rollbackEx) {
                    log.error("Failed to rollback Keycloak user creation: {}", rollbackEx.getMessage());
                    // User remains in Keycloak but not in our database - manual cleanup required
                }
            }
            throw e;
        }
    }

    @Override
    public void deleteUser(UUID id, String password) {
        if (!keycloakService.checkPassword(password)) {
            throw new BadRequestException("Wrong password");
        }

        UserInfo userInfo = userInfoRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        keycloakService.setUserStatusInKeycloak(List.of(userInfo.getUserId()), Boolean.FALSE);
        userInfo.setState(UserInfoState.INACTIVE);
        userInfo.setIsDeleted(Boolean.TRUE);
        userInfoRepository.save(userInfo);
    }

    @Override
    public void deleteUsers(List<UUID> ids, String password) {
        if (CollectionUtils.isEmpty(ids)) {
            throw new BadRequestException("Invalid ids");
        }
        if (!keycloakService.checkPassword(password)) {
            throw new BadRequestException("Invalid password");
        }

        List<UserInfo> users = userInfoRepository.findAllById(ids);
        List<UUID> keycloakUserIds = users.stream()
                .map(UserInfo::getUserId)
                .toList();

        keycloakService.setUserStatusInKeycloak(keycloakUserIds, false);

        users.forEach(user -> {
            user.setState(UserInfoState.INACTIVE);
            user.setIsDeleted(Boolean.TRUE);
        });

        userInfoRepository.saveAll(users);
    }

    @Override
    public Page<UserResponseDto> getUserByCriteria(UserInfoCriteria criteria, Pageable pageable) {
        var users = userInfoRepository
                .findAll(UserInfoSpecifications.byCriteria(criteria), pageable)
                .map(userInfoMapper::toUserResponseDto);
        return new PageImpl<>(users.getContent(), pageable, users.getTotalElements());
    }

    @Override
    public Map<String, UserInfo> getUserInfoByCreatedBy(Set<String> setCreatedBy) {
        if (CollectionUtils.isEmpty(setCreatedBy)) {
            return new HashMap<>();
        }
        List<UserInfo> listUserInfo = userInfoRepository.findAllByEmails(setCreatedBy);
        if (CollectionUtils.isEmpty(listUserInfo)) {
            return new HashMap<>();
        }
        return listUserInfo.stream()
                .collect(Collectors.toMap(UserInfo::getEmail, userInfo -> userInfo));
    }

    @Override
    public UserResponseDto getUserById(UUID id) {
        UserInfo userInfo = userInfoRepository.findById(id)
                .orElseThrow(UserNotFoundException::new);
        return userInfoMapper.toUserResponseDto(userInfo);
    }

    @Override
    public UserResponseDto getCurrentUserInfo() {
        UserRepresentation kcUser = keycloakService.getCurrentUserInfo();
        UserInfo userInfo = userInfoRepository
                .findByEmailIgnoreCase(kcUser.getEmail())
                .orElseThrow(UserNotFoundException::new);

        // Sync profile data from Keycloak if user was invited and completed their
        // profile
        boolean needsSync = false;
        if (Boolean.FALSE.equals(userInfo.getIsUpdatedProfile())) {
            // Check if Keycloak has data that our DB doesn't have (user completed profile
            // in Keycloak)
            boolean keycloakHasFirstName = StringUtils.isNotBlank(kcUser.getFirstName());
            boolean keycloakHasLastName = StringUtils.isNotBlank(kcUser.getLastName());
            boolean dbHasFirstName = StringUtils.isNotBlank(userInfo.getFirstName());
            boolean dbHasLastName = StringUtils.isNotBlank(userInfo.getLastName());

            // Sync if Keycloak has data and DB doesn't, OR if the data is different
            if ((keycloakHasFirstName && !dbHasFirstName) ||
                    (keycloakHasLastName && !dbHasLastName) ||
                    (keycloakHasFirstName && !kcUser.getFirstName().equals(userInfo.getFirstName())) ||
                    (keycloakHasLastName && !kcUser.getLastName().equals(userInfo.getLastName()))) {

                if (keycloakHasFirstName) {
                    userInfo.setFirstName(kcUser.getFirstName());
                }
                if (keycloakHasLastName) {
                    userInfo.setLastName(kcUser.getLastName());
                }
                userInfo.setIsUpdatedProfile(Boolean.TRUE);
                userInfo.setState(UserInfoState.ACTIVE);
                needsSync = true;
                log.info("Synced profile from Keycloak for invited user: {}", userInfo.getEmail());
            }
        }

        // Also sync username from Keycloak if it changed
        if (StringUtils.isNotBlank(kcUser.getUsername()) &&
                !kcUser.getUsername().equals(userInfo.getUsername())) {
            userInfo.setUsername(kcUser.getUsername());
            needsSync = true;
            log.info("Synced username from Keycloak: {} -> {}", userInfo.getUsername(), kcUser.getUsername());
        }

        if (needsSync) {
            userInfoRepository.save(userInfo);
        }

        return userInfoMapper.toUserResponseDto(userInfo);
    }

    @Override
    public void updateUser(UUID id, UpdateUserRequestDto updateUserRequestDto) {
        validateUpdateUserRequest(updateUserRequestDto);

        UserInfo userInfo = userInfoRepository.findById(id)
                .orElseThrow(UserNotFoundException::new);

        try {
            // Update Keycloak user info only if name fields are actually changing
            if (StringUtils.isNotBlank(updateUserRequestDto.getFirstName())
                    || StringUtils.isNotBlank(updateUserRequestDto.getLastName())) {
                boolean nameChanged = !Objects.equals(updateUserRequestDto.getFirstName(), userInfo.getFirstName())
                        || !Objects.equals(updateUserRequestDto.getLastName(), userInfo.getLastName());

                if (nameChanged) {
                    try {
                        keycloakService.updateUserInKeycloak(
                                userInfo.getUserId().toString(),
                                updateUserRequestDto.getFirstName(),
                                updateUserRequestDto.getLastName());
                    } catch (Exception e) {
                        log.warn("Failed to update user in Keycloak (userId: {}), continuing with DB update: {}",
                                userInfo.getUserId(), e.getMessage());
                    }
                }
            }

            // Update basic user info
            userInfoMapper.updateUserInfo(userInfo, updateUserRequestDto);

            // Handle role update
            if (updateUserRequestDto.getRole() != null) {
                UserInfo.UserInfoRole newRole = UserInfo.UserInfoRole.valueOf(
                        updateUserRequestDto.getRole().getValue());
                userInfo.setRole(newRole);
                // Assign role in Keycloak
                try {
                    keycloakService.assignRoleToUser(userInfo.getUserId(), newRole.getValue());
                    log.info("Updated user role to: {}", newRole);
                } catch (Exception e) {
                    log.warn("Failed to assign role in Keycloak (userId: {}), role updated in DB only: {}",
                            userInfo.getUserId(), e.getMessage());
                }
            }

            // Handle state update
            if (updateUserRequestDto.getState() != null) {
                UserInfo.UserInfoState newState = UserInfo.UserInfoState.valueOf(
                        updateUserRequestDto.getState().getValue());
                userInfo.setState(newState);
                // Update enabled status in Keycloak
                try {
                    boolean isActive = newState == UserInfo.UserInfoState.ACTIVE;
                    keycloakService.setUserStatusInKeycloak(List.of(userInfo.getUserId()), isActive);
                    log.info("Updated user state to: {}", newState);
                } catch (Exception e) {
                    log.warn("Failed to update state in Keycloak (userId: {}), state updated in DB only: {}",
                            userInfo.getUserId(), e.getMessage());
                }
            }

            // Handle avatar update - avatar is now object key (UUID)
            if (updateUserRequestDto.getAvatar() != null) {
                // Delete old avatar if exists
                if (StringUtils.isNotBlank(userInfo.getAvatarPath())) {
                    try {
                        minioService.removeFile(userInfo.getAvatarPath(),
                                minioProperties.getBucketAvatar());
                        log.info("Deleted old avatar: {}", userInfo.getAvatarPath());
                    } catch (Exception e) {
                        log.warn("Failed to delete old avatar: {}", userInfo.getAvatarPath(), e);
                    }
                }
                // Set new avatar path (object key from presigned URL upload)
                userInfo.setAvatarPath(updateUserRequestDto.getAvatar().toString());
                log.info("Updated avatar to: {}", userInfo.getAvatarPath());
            }

            // Handle certificate updates
            Set<String> currentCertificates = new java.util.HashSet<>(userInfo.getCertificatePath());

            // Delete specified certificates
            if (CollectionUtils.isNotEmpty(updateUserRequestDto.getDeleteCertificatePaths())) {
                currentCertificates = currentCertificates.stream()
                        .filter(path -> !updateUserRequestDto.getDeleteCertificatePaths().contains(path))
                        .collect(Collectors.toSet());

                // Delete from MinIO
                updateUserRequestDto.getDeleteCertificatePaths().forEach(path -> {
                    try {
                        minioService.removeFile(path, minioProperties.getBucketOther());
                        log.info("Deleted certificate: {}", path);
                    } catch (Exception e) {
                        log.warn("Failed to delete certificate: {}", path, e);
                    }
                });
            }

            // Add new certificates (they are object keys from presigned uploads)
            if (CollectionUtils.isNotEmpty(updateUserRequestDto.getNewCertificates())) {
                currentCertificates.addAll(
                        updateUserRequestDto.getNewCertificates().stream()
                                .map(UUID::toString)
                                .collect(Collectors.toSet()));
                log.info("Added {} new certificates", updateUserRequestDto.getNewCertificates().size());
            }

            userInfo.setCertificatePath(currentCertificates);
            userInfo.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));

            // Mark profile as updated if this is the first update
            if (Boolean.FALSE.equals(userInfo.getIsUpdatedProfile())) {
                userInfo.setIsUpdatedProfile(Boolean.TRUE);
                log.info("Marking profile as updated for user: {}", id);
            }

            userInfoRepository.saveAndFlush(userInfo);

            log.info("Successfully updated user: {}", id);
        } catch (final Exception e) {
            log.error("Failed to update user: {}", id, e);
            throw e;
        }
    }

    @Override
    public void syncUserInfoFromKeycloak(UserRepresentation keycloakUser) {
        String firstName = keycloakUser.getFirstName();
        String lastName = keycloakUser.getLastName();
        if (StringUtils.isNotBlank(firstName) || StringUtils.isNotBlank(lastName)) {
            String email = keycloakUser.getEmail();
            var userInfo = userInfoRepository.findByUserId(UUID.fromString(keycloakUser.getId()))
                    .orElseGet(() -> UserInfo.builder()
                            .email(email)
                            .username(StringUtil.removeEmailSuffix(email))
                            .userId(UUID.fromString(keycloakUser.getId()))
                            .role(UserInfoRole.fromValue(
                                    String.join(",", keycloakService.getUserRolesById(keycloakUser.getId()))))
                            .firstName(firstName)
                            .lastName(lastName)
                            .state(Boolean.TRUE.equals(keycloakUser.isEnabled()) ? UserInfoState.ACTIVE
                                    : UserInfoState.INACTIVE)
                            .build());
            userInfoRepository.save(userInfo);
        }
    }

    @Override
    public void syncInvitedUserInfoFromKeycloak(String userId, String updatedFirstName,
            String updatedLastname) {
        UserInfo userInfo = userInfoRepository.findByUserId(UUID.fromString(userId)).orElseThrow(
                () -> new UserNotFoundException("User info not found with user id " + userId));
        if (StringUtils.isNotBlank(userInfo.getFirstName()) || StringUtils.isNotBlank(
                userInfo.getLastName())) {
            return;
        }
        userInfo.setFirstName(updatedFirstName);
        userInfo.setLastName(updatedLastname);
        userInfo.setIsUpdatedProfile(Boolean.TRUE);
        userInfo.setState(UserInfoState.ACTIVE);
        userInfoRepository.save(userInfo);
    }

    private void validateCreateUserRequest(CreateUserRequestDto requestDto) {
        String email = requestDto.getEmail();
        String phoneNumber = requestDto.getPhoneNumber();
        String password = requestDto.getPassword();

        if (StringUtils.isBlank(email)) {
            throw new BadRequestException("Email is required");
        }
        if (StringUtils.isBlank(password)) {
            throw new BadRequestException("Password is required");
        }
        if (!validateEmail(email)) {
            throw new BadRequestException("Invalid email format");
        }
        if (StringUtils.isNotBlank(phoneNumber) && !validatePhoneNumber(phoneNumber)) {
            throw new BadRequestException("Invalid phone number format");
        }
        if (!validatePassword(password)) {
            throw new BadRequestException("Invalid password");
        }
        if (checkExistEmail(email)) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        if (StringUtils.isNotBlank(phoneNumber) && checkExistPhoneNumber(phoneNumber)) {
            throw new UserAlreadyExistsException("Phone number already exists");
        }
    }

    private void validateUpdateUserRequest(UpdateUserRequestDto requestDto) {
        String phoneNumber = requestDto.getPhoneNumber();
        if (StringUtils.isNotBlank(phoneNumber) && !validatePhoneNumber(phoneNumber)) {
            throw new BadRequestException("Invalid phone number format");
        }
    }

    private boolean validatePhoneNumber(String phoneNumber) {
        return Pattern.compile(Constants.PHONE_NUMBER_PATTERN).matcher(phoneNumber).matches();
    }

    private boolean validateEmail(String email) {
        return Pattern.compile(Constants.EMAIL_PATTERN).matcher(email).matches();
    }

    private boolean validatePassword(String password) {
        if (StringUtils.isBlank(password)) {
            throw new BadRequestException("Password must not be null");
        }
        return Pattern.compile(Constants.PASSWORD_PATTERN).matcher(password).matches();
    }

    private boolean checkExistPhoneNumber(String phoneNumber) {
        if (Objects.isNull(phoneNumber)) {
            return false;
        }
        return userInfoRepository.existsByPhoneNumber(phoneNumber);
    }

    private boolean checkExistEmail(String email) {
        if (Objects.isNull(email)) {
            return false;
        }
        return userInfoRepository.existsByEmail(email);
    }
}
