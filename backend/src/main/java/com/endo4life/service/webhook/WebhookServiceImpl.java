package com.endo4life.service.webhook;

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
import com.endo4life.service.minio.MinioService;
import com.endo4life.service.resource.ResourceService;
import com.endo4life.utils.FileUtil;
import com.endo4life.utils.ResourceUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookServiceImpl implements WebhookService {

    private final ApplicationProperties applicationProperties;
    private final ResourceService resourceService;
    private final MinioService minioService;
    private final WebhookMinIOMapper webhookMinIOMapper;
    private ApplicationProperties.MinioConfiguration minioConfig;

    @PostConstruct
    private void init() {
        this.minioConfig = applicationProperties.minioConfiguration();
    }

    @Override
    public void handleKeycloakEvent(WebhookKeycloakRequestDto request) {
        log.info("Keycloak webhook received: {}", request);
        // Implement Keycloak webhook handling if needed
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

        // Update resource metadata (size, dimension, extension)
        resourceService.updateResourceThumbnail(evtDetail.objectKey());
    }

    @Description("Handle Delete event")
    private void processMinioDeleteEvent() {
        log.info("processDeleteEvent called");
    }
}
