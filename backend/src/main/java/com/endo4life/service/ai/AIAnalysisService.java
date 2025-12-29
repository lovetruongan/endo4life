package com.endo4life.service.ai;

import com.endo4life.web.rest.model.AIAnalysisRequestDto;
import com.endo4life.web.rest.model.AIAnalysisResponseDto;

import java.util.UUID;

/**
 * Service interface for AI-powered image analysis.
 */
public interface AIAnalysisService {

    /**
     * Analyze an image using AI models.
     * 
     * @param resourceId The ID of the resource (image) to analyze
     * @param request    Analysis configuration
     * @return AI analysis results including detections, classifications, and
     *         segmentation
     */
    AIAnalysisResponseDto analyzeImage(UUID resourceId, AIAnalysisRequestDto request);

    /**
     * Analyze an image by URL.
     * 
     * @param imageUrl Direct URL to the image
     * @param request  Analysis configuration
     * @return AI analysis results
     */
    AIAnalysisResponseDto analyzeImageByUrl(String imageUrl, AIAnalysisRequestDto request);

    /**
     * Check if the AI service is available.
     * 
     * @return true if the AI service is healthy
     */
    boolean isServiceHealthy();
}
