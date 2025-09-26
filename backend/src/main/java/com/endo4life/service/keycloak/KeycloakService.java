package com.endo4life.service.keycloak;

import java.util.List;
import java.util.UUID;

import org.keycloak.representations.idm.MappingsRepresentation;
import org.keycloak.representations.idm.UserRepresentation;

public interface KeycloakService {

    MappingsRepresentation getUserRoles(UUID userId);

    UUID createUserInKeycloak(String email, String firstName, String lastName, String role, String password);

    UUID inviteUserInKeycloak(String email, String firstName, String lastName, String role);

    void updateUserInKeycloak(String userId, String firstName, String lastName);

    void setUserStatusInKeycloak(List<UUID> userId, boolean isActive);

    UserRepresentation getUserInfoByUserId(UUID uuid);

    UserRepresentation getCurrentUserInfo();

    boolean checkPassword(String password);

    List<String> getUserRolesById(String userId);

    void deleteUserFromKeycloak(UUID userId);
}
