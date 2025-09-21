package com.endo4life.service.user;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.endo4life.domain.document.UserInfo;
import com.endo4life.web.rest.model.*;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserInfoService {

    UUID createUser(CreateUserRequestDto createUserRequestDto, MultipartFile avatar,
            List<MultipartFile> certificate);

    UUID inviteUser(InviteUserRequestDto inviteUserRequestDto);

    void deleteUser(UUID id, String password);

    Page<UserResponseDto> getUserByCriteria(UserInfoCriteria criteria, Pageable pageable);

    UserResponseDto getUserById(UUID id);

    UserResponseDto getCurrentUserInfo();

    void updateUser(UUID id, UpdateUserRequestDto dto,
            MultipartFile avatar, List<String> deleteCertificatePaths,
            List<MultipartFile> newCertificates);

    void syncUserInfoFromKeycloak(UserRepresentation keycloakUser);

    void syncInvitedUserInfoFromKeycloak(String userId, String updatedFirstName,
            String updatedLastname);

    void deleteUsers(List<UUID> id, String password);

    Map<String, UserInfo> getUserInfoByCreatedBy(Set<String> setCreatedBy);
}
