/**
 * Hook for AI-powered image analysis
 */

import { useState, useCallback } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { EnvConfig } from '@endo4life/feature-config';
import { keycloakUtils } from '@endo4life/data-access';

export interface AIPrediction {
  className: string;
  classNameVi?: string;
  confidence: number;
}

export interface AILocation {
  location: string;
  locationVi?: string;
  giRegion?: string;
  giRegionVi?: string;
  confidence: number;
}

export interface AISeverity {
  severity: string;
  severityVi?: string;
  confidence: number;
}

export interface AIRiskLevel {
  riskLevel: string;
  riskLevelVi?: string;
  confidence: number;
}

export interface AIClinicalSummary {
  finding: string;
  recommendation: string;
  confidenceScore: number;
}

export interface AIAnalysisResult {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  detections: Array<{
    className: string;
    confidence: number;
    bbox: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
    area?: number;
  }>;
  classification?: {
    hpStatus?: AIPrediction;
    lesionType?: AIPrediction;
    location?: AILocation;
    severity?: AISeverity;
    riskLevel?: AIRiskLevel;
    allPredictions?: Record<string, AIPrediction[]>;
  };
  segmentation?: {
    masks: Array<{
      detectionIndex: number;
      polygon: Array<{ x: number; y: number }>;
      area: number;
      iouScore?: number;
    }>;
  };
  processingTimeMs: number;
  suggestedTags?: {
    tag?: string[];
    detailTag?: string[];
    anatomyLocationTag?: string[];
    hpTag?: string[];
    upperGastroAnatomyTag?: string[];
    lightTag?: string[];
  };
  clinicalSummary?: AIClinicalSummary;
}

export interface AIAnalysisRequest {
  runDetection?: boolean;
  runClassification?: boolean;
  runSegmentation?: boolean;
  confidenceThreshold?: number;
}

const API_URL = EnvConfig.Endo4LifeServiceUrl || '';

async function analyzeImage(
  resourceId: string,
  request: AIAnalysisRequest = {}
): Promise<AIAnalysisResult> {
  // Get fresh token using keycloakUtils
  const token = await keycloakUtils.refreshToken();
  
  const response = await fetch(
    `${API_URL}/api/v1/ai/resources/${resourceId}/analyze`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        runDetection: request.runDetection ?? true,
        runClassification: request.runClassification ?? true,
        runSegmentation: request.runSegmentation ?? true,
        confidenceThreshold: request.confidenceThreshold ?? 0.5,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Phân tích AI thất bại');
  }

  return response.json();
}

async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const token = await keycloakUtils.refreshToken();
    const response = await fetch(`${API_URL}/api/v1/ai/health`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.aiServiceAvailable === true;
  } catch {
    return false;
  }
}

export function useAIAnalysis() {
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean | null>(null);

  const analysisMutation = useMutation({
    mutationFn: ({
      resourceId,
      request,
    }: {
      resourceId: string;
      request?: AIAnalysisRequest;
    }) => analyzeImage(resourceId, request),
    onSuccess: (data) => {
      setResult(data);
      const detectionsCount = data.detections?.length || 0;
      toast.success(
        `Phân tích hoàn tất! Phát hiện ${detectionsCount} vùng tổn thương.`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Phân tích AI thất bại');
    },
  });

  const analyze = useCallback(
    (resourceId: string, request?: AIAnalysisRequest) => {
      return analysisMutation.mutateAsync({ resourceId, request });
    },
    [analysisMutation]
  );

  const checkHealth = useCallback(async () => {
    const available = await checkAIServiceHealth();
    setIsServiceAvailable(available);
    return available;
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    analyze,
    checkHealth,
    clearResult,
    result,
    isLoading: analysisMutation.isLoading,
    isError: analysisMutation.isError,
    error: analysisMutation.error,
    isServiceAvailable,
  };
}

