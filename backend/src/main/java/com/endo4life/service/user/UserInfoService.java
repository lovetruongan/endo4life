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

public interface UserInfoService {

        UUID createUser(CreateUserRequestDto createUserRequestDto);

        UUID inviteUser(InviteUserRequestDto inviteUserRequestDto);

        void deleteUser(UUID id, String password);

        Page<UserResponseDto> getUserByCriteria(UserInfoCriteria criteria, Pageable pageable);

        UserResponseDto getUserById(UUID id);

        UserResponseDto getCurrentUserInfo();

        void updateUser(UUID id, UpdateUserRequestDto dto);

        void syncUserInfoFromKeycloak(UserRepresentation keycloakUser);

        void syncInvitedUserInfoFromKeycloak(String userId, String updatedFirstName,
                        String updatedLastname);

        void deleteUsers(List<UUID> id, String password);

        Map<String, UserInfo> getUserInfoByCreatedBy(Set<String> setCreatedBy);
}
