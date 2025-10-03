package com.endo4life.service.webhook;

import com.endo4life.web.rest.model.WebhookMinIOEventDto;
import com.endo4life.web.rest.model.WebhookKeycloakRequestDto;

public interface WebhookService {
    void handleKeycloakEvent(WebhookKeycloakRequestDto content);

    void handleMinioEvent(WebhookMinIOEventDto webhookMinIOEventDto);
}
