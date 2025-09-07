package com.endo4life.service.keycloak;

import com.endo4life.config.ApplicationProperties;
import com.endo4life.security.UserContextHolder;
import com.endo4life.security.AuthoritiesConstants;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.UUID;
import java.util.Collections;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.jboss.resteasy.client.jaxrs.internal.ResteasyClientBuilderImpl;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.AccessTokenResponse;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.MappingsRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class KeycloakServiceImpl implements KeycloakService {

    private final ApplicationProperties applicationProperties;
    private RealmResource realmResource;

    @PostConstruct
    private void init() {
        Keycloak keycloak = KeycloakBuilder.builder()
                .serverUrl(applicationProperties.keycloakConfiguration().baseUrl())
                .realm(applicationProperties.keycloakConfiguration().realm())
                .clientId(applicationProperties.keycloakConfiguration().clientId())
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .clientSecret(applicationProperties.keycloakConfiguration().secret())
                .resteasyClient(new ResteasyClientBuilderImpl().connectionPoolSize(10).build())
                .build();

        this.realmResource = keycloak.realm(applicationProperties.keycloakConfiguration().realm());

        testConnection();
    }

    public void testConnection() {
        try {
            String realmInfo = realmResource.toRepresentation().getRealm();
            log.info("Successfully connected to Keycloak. Realm: {}", realmInfo);
        } catch (Exception e) {
            log.info("Failed to connect to Keycloak: {}", e.getMessage());
        }
    }

    @Override
    public MappingsRepresentation getUserRoles(UUID userId) {
        UserResource userResource = realmResource.users().get(String.valueOf(userId));
        return userResource.roles().getAll();
    }

    @Override
    public UUID createUserInKeycloak(String email, String firstName, String lastName, String role) {
        UserRepresentation keycloakUser = new UserRepresentation();
        keycloakUser.setEmail(email);
        keycloakUser.setFirstName(firstName);
        keycloakUser.setLastName(lastName);
        keycloakUser.setUsername(removeEmailSuffix(email));
        keycloakUser.setEnabled(true);

        var createdId = createKeycloakUser(keycloakUser);
        assignRoleToUser(createdId, role);
        return createdId;
    }

    @Override
    public UUID inviteUserInKeycloak(String email, String firstName, String lastName, String role) {
        UUID userId = createUserInKeycloak(email, firstName, lastName, role);
        sendVerificationEmail(userId.toString(), email);
        return userId;
    }

    public void assignRoleToUser(UUID userId, String roleName) {
        var userResource = realmResource.users().get(userId.toString());

        // Retrieve current roles
        var currentRoles = userResource.roles().getAll().getClientMappings();
        if (currentRoles != null) {
            var rolesToRemove = currentRoles.values().stream()
                    .flatMap(mapping -> mapping.getMappings().stream())
                    .toList();

            if (!rolesToRemove.isEmpty()) {
                for (var role : rolesToRemove) {
                    userResource.roles().clientLevel(role.getContainerId()).remove(List.of(role));
                }
            }
        }

        String clientUuid;
        var clientRepresentation = realmResource.clients().findAll()
                .stream()
                .filter(client -> client.getClientId()
                        .equalsIgnoreCase(applicationProperties.keycloakConfiguration().clientId()))
                .findFirst();
        if (clientRepresentation.isPresent()) {
            clientUuid = clientRepresentation.get().getId();
        } else {
            throw new NoSuchElementException("No client found with the specified client ID");
        }
        RoleRepresentation roleRepresentation = realmResource.clients()
                .get(clientUuid)
                .roles()
                .get(roleName)
                .toRepresentation();

        realmResource.users().get(String.valueOf(userId)).roles().clientLevel(clientUuid)
                .add(List.of(roleRepresentation));
    }

    @Override
    public void updateUserInKeycloak(String userId, String firstName, String lastName) {
        UserRepresentation keycloakUser = realmResource.users().get(userId).toRepresentation();
        keycloakUser.setFirstName(firstName);
        keycloakUser.setLastName(lastName);
        realmResource.users().get(userId).update(keycloakUser);
    }

    @Override
    public void setUserStatusInKeycloak(List<UUID> userIds, boolean isActive) {
        if (CollectionUtils.isEmpty(userIds)) {
            throw new IllegalArgumentException("User ids cannot be empty");
        }

        for (UUID userId : userIds) {
            UserResource userResource = realmResource.users().get(String.valueOf(userId));
            UserRepresentation userRepresentation = userResource.toRepresentation();
            userRepresentation.setEnabled(isActive);
            userResource.update(userRepresentation);
        }
    }

    @Override
    public UserRepresentation getUserInfoByUserId(UUID uuid) {
        try {
            UsersResource userResource = realmResource.users();
            var kcUser = userResource.get(uuid.toString());
            if (Objects.isNull(kcUser)) {
                return null;
            }
            return kcUser.toRepresentation();
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return null;
        }
    }

    @Override
    public UserRepresentation getCurrentUserInfo() {
        final String userId = UserContextHolder.getUserId()
                .orElseThrow();
        UsersResource userResource = realmResource.users();
        UserRepresentation userRepresentation = userResource.get(userId).toRepresentation();
        if (Objects.isNull(userRepresentation)) {
            return null;
        }
        return userRepresentation;
    }

    private UUID createKeycloakUser(UserRepresentation user) {
        var usersResource = realmResource.users();
        return UUID.fromString(CreatedResponseUtil.getCreatedId(usersResource.create(user)));
    }

    private void sendVerificationEmail(String userId, String email) {
        UserResource userResource = realmResource.users().get(userId);
        List<String> requiredActions = List.of("VERIFY_EMAIL", "UPDATE_PROFILE", "UPDATE_PASSWORD");
        userResource.executeActionsEmail(requiredActions,
                applicationProperties.keycloakConfiguration()
                        .inviteLifespan());
        log.info("Verification email sent to {}", email);
    }

    @Override
    public boolean checkPassword(String password) {
        try {
            UserResource userResource = realmResource.users()
                    .get(StringUtils.defaultString(UserContextHolder.getUserId().orElse(null)));
            UserRepresentation userRepresentation = userResource.toRepresentation();
            String username = userRepresentation.getUsername();

            Keycloak keycloakUserClient = KeycloakBuilder.builder()
                    .serverUrl(applicationProperties.keycloakConfiguration().baseUrl())
                    .realm(applicationProperties.keycloakConfiguration().realm())
                    .clientId(applicationProperties.keycloakConfiguration().clientId())
                    .grantType(OAuth2Constants.PASSWORD)
                    .username(username)
                    .password(password)
                    .clientSecret(applicationProperties.keycloakConfiguration().secret())
                    .resteasyClient(new ResteasyClientBuilderImpl().connectionPoolSize(10).build())
                    .build();
            AccessTokenResponse tokenResponse = keycloakUserClient.tokenManager().getAccessToken();

            return tokenResponse != null && tokenResponse.getToken() != null;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<String> getUserRolesById(String userId) {
        return getUserRoles(UUID.fromString(userId)).getClientMappings()
                .get(applicationProperties.keycloakConfiguration().clientId()).getMappings().stream()
                .map(RoleRepresentation::getName).toList();
    }

    private String removeEmailSuffix(String email) {
        return email.substring(0, email.indexOf("@"));
    }
}
