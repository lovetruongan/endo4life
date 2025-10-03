package com.endo4life.config;

import com.endo4life.constant.Constants;
import com.endo4life.service.minio.MinioProperties;
import com.endo4life.utils.MinioUtil;
import com.endo4life.utils.minio.MinIOUtil;
import com.endo4life.web.rest.model.ResourceType;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketNotificationArgs;
import io.minio.SetBucketPolicyArgs;
import io.minio.messages.EventType;
import io.minio.messages.NotificationConfiguration;
import io.minio.messages.QueueConfiguration;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class MinioConfiguration {

    private final MinioProperties minioProperties;

    @Value("${spring.application.minio-configuration.bucket-video}")
    private String bucketVideo;
    @Value("${spring.application.minio-configuration.bucket-image}")
    private String bucketImage;
    @Value("${spring.application.minio-configuration.bucket-avatar}")
    private String bucketAvatar;
    @Value("${spring.application.minio-configuration.bucket-thumbnail}")
    private String bucketThumbnail;
    @Value("${spring.application.minio-configuration.bucket-other}")
    private String bucketOther;
    @Value("${spring.application.minio-configuration.bucket-process}")
    private String bucketProcess;

    @PostConstruct
    private void init() {
        // Initialize bucket mappings
        MinIOUtil.setBucketResourceMap(ResourceType.VIDEO, bucketVideo);
        MinIOUtil.setBucketResourceMap(ResourceType.IMAGE, bucketImage);
        MinIOUtil.setBucketResourceMap(ResourceType.AVATAR, bucketAvatar);
        MinIOUtil.setBucketResourceMap(ResourceType.THUMBNAIL, bucketThumbnail);
        MinIOUtil.setBucketResourceMap(ResourceType.OTHER, bucketOther);
        MinIOUtil.setBucketResourceMap(ResourceType.PROCESS, bucketProcess);
    }

    @Bean
    public MinioClient minioClient() throws Exception {
        try {
            MinioClient.Builder builder = MinioClient.builder()
                    .endpoint(minioProperties.getEndpoint())
                    .credentials(minioProperties.getUsername(), minioProperties.getPassword());

            // Only set region if explicitly configured
            if (minioProperties.getRegion() != null && !minioProperties.getRegion().isEmpty()) {
                builder.region(minioProperties.getRegion());
                log.info("MinIO region set to: {}", minioProperties.getRegion());
            } else {
                log.info("MinIO region not set (auto-detect)");
            }

            MinioClient client = builder.build();

            // Create buckets if not exist
            createBucketIfNotExist(client, minioProperties.getBucketVideo());
            createBucketIfNotExist(client, minioProperties.getBucketImage());
            createBucketIfNotExist(client, minioProperties.getBucketAvatar());
            createBucketIfNotExist(client, minioProperties.getBucketThumbnail());
            createBucketIfNotExist(client, minioProperties.getBucketOther());
            createBucketIfNotExist(client, minioProperties.getBucketProcess());

            // Assign Policy to public buckets
            var objectOps = Constants.MinioObjectOperations;
            var actionsForPublicBucket = new String[] {
                    objectOps.get("Get"),
                    objectOps.get("Put"),
                    objectOps.get("Delete")
            };

            setBucketPolicy(client, minioProperties.getBucketThumbnail(),
                    MinioUtil.generatePolicyPublic(minioProperties.getBucketThumbnail(), actionsForPublicBucket));
            setBucketPolicy(client, minioProperties.getBucketAvatar(),
                    MinioUtil.generatePolicyPublic(minioProperties.getBucketAvatar(), actionsForPublicBucket));
            setBucketPolicy(client, minioProperties.getBucketOther(),
                    MinioUtil.generatePolicyPublic(minioProperties.getBucketOther(), actionsForPublicBucket));

            // TODO: Setup webhook notifications for automatic thumbnail generation
            // First configure webhook in MinIO server, then uncomment this:
            /*
             * List<EventType> webhookEvents = List.of(EventType.OBJECT_CREATED_ANY);
             * 
             * QueueConfiguration queueConfiguration = new QueueConfiguration();
             * queueConfiguration.setQueue(
             * String.format(Constants.queueArnWebhook,
             * minioProperties.getWebhookIdentifier()));
             * queueConfiguration.setEvents(webhookEvents);
             * 
             * NotificationConfiguration notiConfig = new NotificationConfiguration();
             * notiConfig.setQueueConfigurationList(List.of(queueConfiguration));
             * 
             * // Set notifications for image and video buckets
             * setNotificationForBucket(client, notiConfig,
             * minioProperties.getBucketImage());
             * setNotificationForBucket(client, notiConfig,
             * minioProperties.getBucketVideo());
             * setNotificationForBucket(client, notiConfig,
             * minioProperties.getBucketProcess());
             */

            return client;
        } catch (Exception e) {
            log.error("Failed to initialize Minio client", e);
            throw new RuntimeException("Failed to initialize Minio client", e);
        }
    }

    @SneakyThrows
    private void createBucketIfNotExist(MinioClient client, String bucketName) {
        if (!client.bucketExists(BucketExistsArgs.builder()
                .bucket(bucketName).build())) {
            client.makeBucket(
                    MakeBucketArgs
                            .builder()
                            .bucket(bucketName)
                            .build());
            log.info("Bucket {} created", bucketName);
        }
    }

    @SneakyThrows
    private void setBucketPolicy(MinioClient client, String bucketName, String policy) {
        client.setBucketPolicy(
                SetBucketPolicyArgs.builder()
                        .bucket(bucketName)
                        .config(policy)
                        .build());
    }

    @SneakyThrows
    private void setNotificationForBucket(MinioClient client, NotificationConfiguration notiConfig,
            String bucketName) {
        client.setBucketNotification(
                SetBucketNotificationArgs.builder()
                        .bucket(bucketName)
                        .config(notiConfig)
                        .build());
        log.info("Webhook notification set for bucket: {}", bucketName);
    }
}
