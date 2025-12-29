package com.endo4life.service.ai;

import com.endo4life.domain.document.Resource;
import com.endo4life.repository.ResourceRepository;
import com.endo4life.service.minio.MinioProperties;
import com.endo4life.web.rest.model.AIAnalysisRequestDto;
import com.endo4life.web.rest.model.AIAnalysisResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

/**
 * Implementation of AI Analysis Service.
 * Communicates with the Python AI service via REST API.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIAnalysisServiceImpl implements AIAnalysisService {
    
    private final ResourceRepository resourceRepository;
    private final MinioProperties minioProperties;
    private final RestTemplate restTemplate;
    
    @Value("${ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;
    
    @Override
    public AIAnalysisResponseDto analyzeImage(UUID resourceId, AIAnalysisRequestDto request) {
        log.info("Analyzing resource: {}", resourceId);
        
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found: " + resourceId));
        
        String imageUrl = buildImageUrl(resource.getPath());
        return analyzeImageByUrl(imageUrl, request);
    }
    
    @Override
    public AIAnalysisResponseDto analyzeImageByUrl(String imageUrl, AIAnalysisRequestDto request) {
        log.info("Analyzing image: {}", imageUrl);
        
        try {
            String url = aiServiceUrl + "/api/v1/analyze";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("image_url", imageUrl);
            body.add("run_detection", String.valueOf(
                    request.getRunDetection() != null ? request.getRunDetection() : true));
            body.add("run_classification", String.valueOf(
                    request.getRunClassification() != null ? request.getRunClassification() : true));
            body.add("run_segmentation", String.valueOf(
                    request.getRunSegmentation() != null ? request.getRunSegmentation() : true));
            
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
            
            ResponseEntity<AIAnalysisResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    AIAnalysisResponseDto.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Analysis complete. Found {} detections", 
                        response.getBody().getDetections() != null 
                                ? response.getBody().getDetections().size() 
                                : 0);
                return response.getBody();
            } else {
                throw new RuntimeException("AI service returned error: " + response.getStatusCode());
            }
            
        } catch (RestClientException e) {
            log.error("Failed to call AI service: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable", e);
        }
    }
    
    @Override
    public boolean isServiceHealthy() {
        try {
            String url = aiServiceUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("AI service health check failed: {}", e.getMessage());
            return false;
        }
    }
    
    private String buildImageUrl(String path) {
        return String.format("%s/%s/%s",
                minioProperties.getEndpoint(),
                minioProperties.getBucketImage(),
                path);
    }
}
