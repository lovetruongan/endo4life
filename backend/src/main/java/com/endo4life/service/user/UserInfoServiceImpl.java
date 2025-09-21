package com.endo4life.service.user;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
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
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserInfoServiceImpl implements UserInfoService {

    private final UserInfoRepository userInfoRepository;
    private final UserInfoMapper userInfoMapper;
    private final KeycloakService keycloakService;

    @Override
    public UUID createUser(CreateUserRequestDto createUserRequestDto, MultipartFile avatar,
            List<MultipartFile> certificate) {
        validateCreateUserRequest(createUserRequestDto);

        // Create user in Keycloak first
        UUID userId = keycloakService.createUserInKeycloak(
                createUserRequestDto.getEmail(),
                createUserRequestDto.getFirstName(),
                createUserRequestDto.getLastName(),
                createUserRequestDto.getRole().getValue());

        // Create user in our database
        UserInfo userInfo = userInfoMapper.toUserInfo(createUserRequestDto);
        userInfo.setUserId(userId);
        userInfo.setCreatedAt(LocalDateTime.now());
        userInfo.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        userInfoRepository.save(userInfo);

        // TODO: Handle avatar and certificate uploads when MinIO is ready

        return userInfo.getId();
    }

    @Override
    public UUID inviteUser(InviteUserRequestDto requestDto) {
        validateEmail(requestDto.getEmail());

        UUID userId = keycloakService.inviteUserInKeycloak(
                requestDto.getEmail(),
                requestDto.getFirstName(),
                requestDto.getLastName(),
                requestDto.getRole().getValue());

        UserInfo userInfo = userInfoMapper.toUserInfo(requestDto);
        userInfo.setUserId(userId);
        userInfo.setState(UserInfoState.PENDING);
        userInfo.setCreatedAt(LocalDateTime.now());
        userInfo.setCreatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
        userInfoRepository.save(userInfo);

        return userInfo.getId();
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

        return userInfoMapper.toUserResponseDto(userInfo);
    }

    @Override
    public void updateUser(UUID id, UpdateUserRequestDto updateUserRequestDto,
            MultipartFile avatar, List<String> deleteCertificatePaths,
            List<MultipartFile> newCertificates) {
        validateUpdateUserRequest(updateUserRequestDto);

        UserInfo userInfo = userInfoRepository.findById(id)
                .orElseThrow(UserNotFoundException::new);

        try {
            keycloakService.updateUserInKeycloak(userInfo.getUserId().toString(),
                    updateUserRequestDto.getFirstName(), updateUserRequestDto.getLastName());

            userInfoMapper.updateUserInfo(userInfo, updateUserRequestDto);

            // TODO: Handle avatar and certificate updates when MinIO is ready

            userInfo.setUpdatedBy(UserContextHolder.getEmail().orElse(Constants.SYSTEM));
            userInfoRepository.saveAndFlush(userInfo);
        } catch (final Exception e) {
            // TODO: Cleanup uploaded files if any
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
