package com.endo4life.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.web.cors.CorsConfiguration;

@ConfigurationProperties(prefix = "spring.application", ignoreUnknownFields = false)
public record ApplicationProperties(
                KeycloakConfiguration keycloakConfiguration,
                MinioConfiguration minioConfiguration,
                CorsConfiguration cors,
                String name,
                Job job) {

        public record KeycloakConfiguration(
                        String baseUrl,
                        String internalUrl,
                        String realm,
                        String clientId,
                        String secret,
                        String issuerUri,
                        String jwkSetUri,
                        WebhookConfiguration webhook,
                        Integer inviteLifespan) {
        }

        public record WebhookConfiguration(
                        Boolean enabled,
                        String clientId,
                        String secret,
                        String realm,
                        String path) {
        }

        public record MinioConfiguration(
                        String endpoint,
                        String username,
                        String password,
                        String webhookIdentifier,
                        String bucketVideo,
                        String bucketImage,
                        String bucketAvatar,
                        String bucketThumbnail,
                        String bucketOther,
                        String bucketProcess,
                        String bucketBook) {
        }

        public record Job(
                        DeleteUser deleteUser) {
        }

        public record DeleteUser(
                        boolean enabled,
                        String cron) {
        }
}
