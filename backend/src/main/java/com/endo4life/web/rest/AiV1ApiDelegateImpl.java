package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.ai.AIAnalysisService;
import com.endo4life.web.rest.api.AiV1ApiDelegate;
import com.endo4life.web.rest.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Delegate implementation for AI-powered image analysis endpoints.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AiV1ApiDelegateImpl implements AiV1ApiDelegate {

    private final AIAnalysisService aiAnalysisService;

    @Override
    @RoleAccess.ContentManager
    public ResponseEntity<AIAnalysisResponseDto> analyzeResource(
            UUID resourceId,
            AIAnalysisRequestDto request) {
        
        if (request == null) {
            request = new AIAnalysisRequestDto();
        }
        
        log.info("AI analysis request for resource: {}", resourceId);
        
        var response = aiAnalysisService.analyzeImage(resourceId, request);
        return ResponseEntity.ok(response);
    }

    @Override
    @RoleAccess.ContentManager
    public ResponseEntity<AIAnalysisResponseDto> analyzeByUrl(
            String imageUrl,
            AIAnalysisRequestDto request) {
        
        if (request == null) {
            request = new AIAnalysisRequestDto();
        }
        
        log.info("AI analysis request for URL: {}", imageUrl);
        
        var response = aiAnalysisService.analyzeImageByUrl(imageUrl, request);
        return ResponseEntity.ok(response);
    }

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<AIHealthResponseDto> getAIHealth() {
        boolean isHealthy = aiAnalysisService.isServiceHealthy();
        
        var response = new AIHealthResponseDto()
                .status(isHealthy ? "healthy" : "unhealthy")
                .aiServiceAvailable(isHealthy);
        
        return ResponseEntity.ok(response);
    }
}

