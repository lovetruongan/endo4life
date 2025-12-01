package com.endo4life.service.minio;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "spring.application.minio-configuration", ignoreUnknownFields = false)
public class MinioProperties {
    private String endpoint;
    private String username;
    private String password;
    private String webhookIdentifier;
    private String region;

    private String bucketVideo;
    private String bucketImage;
    private String bucketAvatar;
    private String bucketThumbnail;
    private String bucketOther;
    private String bucketProcess;
    private String bucketBook;
}