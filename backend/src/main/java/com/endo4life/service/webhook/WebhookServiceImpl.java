package com.endo4life.service.webhook;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.endo4life.web.rest.model.WebhookMinIOEventDto;
import com.endo4life.web.rest.model.WebhookKeycloakRequestDto;
import jakarta.annotation.PostConstruct;
import jdk.jfr.Description;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.config.ApplicationProperties;
import com.endo4life.constant.Constants;
import com.endo4life.domain.dto.DetailMinIOEventDto;
import com.endo4life.mapper.WebhookMinIOMapper;
import com.endo4life.service.keycloak.KeycloakService;
import com.endo4life.service.minio.MinioService;
import com.endo4life.service.resource.ResourceService;
import com.endo4life.service.user.UserInfoService;
import com.endo4life.utils.FileUtil;
import com.endo4life.utils.ResourceUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static com.endo4life.utils.JsonStringUtil.toJsonString;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookServiceImpl implements WebhookService {

    private final ApplicationProperties applicationProperties;
    private final RestTemplate restTemplate;
    private final KeycloakService keycloakService;
    private final UserInfoService userInfoService;
    private final ResourceService resourceService;
    private final MinioService minioService;
    private final WebhookMinIOMapper webhookMinIOMapper;
    private ApplicationProperties.MinioConfiguration minioConfig;
    private boolean webhookEnabled;

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @PostConstruct
    public void initWebhook() {
        initKeycloakWebhook();
        initMinioWebhook();
    }

    public void initKeycloakWebhook() {
        var keycloakConfig = applicationProperties.keycloakConfiguration();
        var webhookConfig = keycloakConfig.webhook();
        webhookEnabled = webhookConfig.enabled();
        log.info("Webhook enabled: {}", webhookEnabled);

        if (webhookEnabled) {
            try {
                var keycloak = KeycloakBuilder.builder()
                        .serverUrl(keycloakConfig.baseUrl())
                        .realm(webhookConfig.realm())
                        .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                        .clientId(webhookConfig.clientId())
                        .clientSecret(webhookConfig.secret())
                        .build();

                // Verify connection
                String realmInfo = keycloak.realm(webhookConfig.realm())
                        .toRepresentation()
                        .getRealm();
                log.info("Successfully connected to Keycloak. Realm: {}", realmInfo);

                // Get access token for webhook registration
                var accessToken = keycloak.tokenManager().getAccessToken().getToken();
                log.info("Successfully obtained access token for webhook registration");

                // Try to register webhook via Keycloak Admin API
                // Note: This requires PhaseTwo webhook extension to be installed on Keycloak
                // server
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    headers.setBearerAuth(accessToken);

                    Map<String, Object> payload = new HashMap<>();
                    payload.put("enabled", webhookConfig.enabled());
                    payload.put("url", webhookConfig.path());
                    payload.put("secret", "webhook-secret"); // Configure this properly in production
                    payload.put("eventTypes", Constants.KEYCLOAK_HANDLING_EVENT);

                    var requestEntity = new HttpEntity<>(payload, headers);

                    // This endpoint requires PhaseTwo extension to be installed on Keycloak
                    String webhookUrl = keycloakConfig.internalUrl() + "/realms/" + keycloakConfig.realm()
                            + "/webhooks";
                    var response = restTemplate.exchange(
                            webhookUrl,
                            HttpMethod.POST,
                            requestEntity,
                            String.class);

                    log.info("Webhook registered - Status: {}, Body: {}",
                            response.getStatusCode(), response.getBody());
                } catch (Exception webhookEx) {
                    log.warn("Failed to register webhook (PhaseTwo extension may not be installed): {}",
                            webhookEx.getMessage());
                    log.info("Webhook handler is ready to receive events at: {}", webhookConfig.path());
                }
            } catch (Exception e) {
                log.error("Failed to initialize Keycloak webhook: {}", e.getMessage(), e);
            }
        }
    }

    public void initMinioWebhook() {
        this.webhookEnabled = Boolean.TRUE;
        log.info("MinIO webhook initialized");
    }

    @Override
    public void handleKeycloakEvent(WebhookKeycloakRequestDto request) {
        if (webhookEnabled) {
            var resourceType = request.getResourceType();
            var context = (String) request.getDetails().get("context");

            if (StringUtils.equalsIgnoreCase(resourceType, Constants.KEYCLOAK_RESOURCE_TYPE_USER)
                    && CollectionUtils.containsAny(Constants.KEYCLOAK_HANDLING_OPERATION,
                            request.getOperationType())) {
                log.info("Received sync user info request: {}", toJsonString(request));
                syncUserInfo(request.getDetails());
            }

            if (StringUtils.equalsIgnoreCase(context, Constants.KEYCLOAK_UPDATE_PROFILE)) {
                log.info("Received sync invited user info request: {}", toJsonString(request));
                syncInvitedUserInfo(request);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void syncInvitedUserInfo(WebhookKeycloakRequestDto request) {
        var firstName = (String) request.getDetails().get("updated_first_name");
        var lastName = (String) request.getDetails().get("updated_last_name");

        // authDetails is an Object, need to cast to Map to access userId
        String userId = null;
        if (request.getAuthDetails() instanceof Map) {
            Map<String, Object> authDetailsMap = (Map<String, Object>) request.getAuthDetails();
            userId = (String) authDetailsMap.get("userId");
        }

        if (userId == null) {
            log.warn("Unable to extract userId from authDetails");
            return;
        }

        log.info("Sync invited user with user id {}", userId);
        userInfoService.syncInvitedUserInfoFromKeycloak(userId, firstName, lastName);
    }

    private void syncUserInfo(Map<String, Object> updatedDetail) {
        var userIdString = (String) updatedDetail.get("userId");
        var userId = UUID.fromString(userIdString);
        var keycloakUser = keycloakService.getUserInfoByUserId(userId);
        var roles = keycloakService.getUserRoles(UUID.fromString(userIdString));
        log.info("User info in keycloak {}", toJsonString(keycloakUser));
        log.info("Roles in keycloak {}", toJsonString(roles));
        log.info("Sync user id {}", userIdString);

        try {
            log.info("Update userId = {}", userIdString);
            userInfoService.syncUserInfoFromKeycloak(keycloakUser);
        } catch (final Exception e) {
            log.error("Failed to update user info: userId = {}", userIdString, e);
        }
    }

    @Override
    public void handleMinioEvent(WebhookMinIOEventDto event) {
        DetailMinIOEventDto eventDetail = webhookMinIOMapper.toEventDetail(event);
        Pattern pattern = Pattern.compile(Constants.DIVIDED_MULTIPART_FILE_PATTERN);
        Matcher matcher = pattern.matcher(eventDetail.objectKey());
        if (matcher.find()) {
            return;
        }
        log.info("webhookMinIOEventDto: {}", event);
        log.info("action: {}", eventDetail.action());
        switch (eventDetail.action()) {
            case PUT, COMPLETE_MULTIPART_UPLOAD, COPY -> processMinioPutEvent(eventDetail);
            case DELETE -> processMinioDeleteEvent();
            case HEAD -> log.info("Detected divided part, skipping handle webhook action");
            default -> log.error("Unsupported action: {}", eventDetail.action());
        }
    }

    @Description("Handle Put event - auto-generate thumbnails or process compressed files")
    private void processMinioPutEvent(DetailMinIOEventDto evtDetail) {
        log.info("processPutEvent called for bucket: {}, key: {}", evtDetail.bucket(), evtDetail.objectKey());
        InputStream stream = minioService.getFile(evtDetail.bucket(), evtDetail.objectKey());

        if (stream == null) {
            log.error("Failed to get file from MinIO");
            return;
        }

        // Handle compressed files from process bucket
        if (StringUtils.equalsIgnoreCase(evtDetail.bucket(), minioConfig.bucketProcess())) {
            String contentType = FileUtil.getFileExtension(evtDetail.objectKey());
            MultipartFile file = FileUtil.toMultipartFile(
                    stream,
                    evtDetail.objectKey(),
                    contentType);

            if (Constants.COMPRESSED_EXTENSIONS.contains(contentType)) {
                log.info("Processing compressed file: {}", evtDetail.objectKey());
                resourceService.handleCompressedFile(file);
            } else {
                // Handle other process bucket files if needed
                log.info("Non-compressed file in process bucket: {}", evtDetail.objectKey());
            }

            // Remove the file from process bucket after processing
            minioService.removeFile(evtDetail.objectKey(), evtDetail.bucket());
            return;
        }

        // For videos, extract first frame as thumbnail
        // For images, use the image itself
        byte[] imageBytes;
        if (StringUtils.equalsIgnoreCase(evtDetail.bucket(), minioConfig.bucketVideo())) {
            imageBytes = ResourceUtil.getFirstFrame(stream);
        } else {
            try {
                imageBytes = stream.readAllBytes();
            } catch (Exception e) {
                log.error("Failed to read image bytes", e);
                return;
            }
        }

        MultipartFile frame = FileUtil.toMultipartFile(
                imageBytes,
                evtDetail.objectKey(),
                Constants.THUMBNAIL_CONTENT_TYPE);

        // Generate thumbnails (resource already has thumbnail name set)
        resourceService.createThumbnail(frame);
    }

    @Description("Handle Delete event")
    private void processMinioDeleteEvent() {
        log.info("processDeleteEvent called");
    }
}
