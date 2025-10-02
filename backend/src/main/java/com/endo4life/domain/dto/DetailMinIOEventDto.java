package com.endo4life.domain.dto;

import com.endo4life.web.rest.model.WebhookMinIOEventDto;
import lombok.Builder;
import com.endo4life.domain.enumeration.MinIOEventAction;

@Builder
public record DetailMinIOEventDto(
        MinIOEventAction action,
        String bucket,
        String objectKey,
        WebhookMinIOEventDto event) {
}
