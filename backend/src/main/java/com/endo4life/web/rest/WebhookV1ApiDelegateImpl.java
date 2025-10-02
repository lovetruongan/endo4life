package com.endo4life.web.rest;

import com.endo4life.web.rest.api.WebhookV1ApiDelegate;
import com.endo4life.web.rest.model.WebhookKeycloakRequestDto;
import com.endo4life.web.rest.model.WebhookMinIOEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.endo4life.service.webhook.WebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebhookV1ApiDelegateImpl implements WebhookV1ApiDelegate {

    private final WebhookService webhookService;

    @Override
    public ResponseEntity<Void> subscribeKeycloakEvent(WebhookKeycloakRequestDto webhookRequest) {
        webhookService.handleKeycloakEvent(webhookRequest);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> subscribeMinioEvent(WebhookMinIOEventDto webhookMinIOEventDto) {
        webhookService.handleMinioEvent(webhookMinIOEventDto);
        return ResponseEntity.ok().build();
    }
}
