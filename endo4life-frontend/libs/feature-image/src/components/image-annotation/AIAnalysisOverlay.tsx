/**
 * AI Analysis Overlay Component
 * Displays AI analysis results with bounding boxes and classifications
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import { HiSparkles, HiCheckCircle } from 'react-icons/hi2';
import { AIAnalysisResult, Annotation, BoundingBoxAnnotation, PolygonAnnotation } from './types';

interface AIAnalysisOverlayProps {
  result: AIAnalysisResult | null;
  isLoading: boolean;
  onApplyToAnnotations: (annotations: Annotation[]) => void;
  onApplyTags: (tags: { hpTag?: string[]; tag?: string[]; detailTag?: string[] }) => void;
}

export function AIAnalysisOverlay({
  result,
  isLoading,
  onApplyToAnnotations,
  onApplyTags,
}: AIAnalysisOverlayProps) {
  const handleApplyDetections = () => {
    if (!result) return;

    const annotations: Annotation[] = [];

    // Convert detections to bbox annotations
    result.detections.forEach((detection, index) => {
      const annotation: BoundingBoxAnnotation = {
        id: `ai-detection-${index}-${Date.now()}`,
        type: 'bbox',
        label: detection.class_name,
        color: getColorForClass(detection.class_name),
        confidence: detection.confidence,
        isAIGenerated: true,
        createdAt: new Date().toISOString(),
        bbox: {
          x: detection.bbox.x1,
          y: detection.bbox.y1,
          width: detection.bbox.x2 - detection.bbox.x1,
          height: detection.bbox.y2 - detection.bbox.y1,
        },
      };
      annotations.push(annotation);
    });

    // Convert segmentation masks to polygon annotations
    if (result.segmentation?.masks) {
      result.segmentation.masks.forEach((mask, index) => {
        if (mask.polygon.length >= 3) {
          const detection = result.detections[mask.detection_index];
          const annotation: PolygonAnnotation = {
            id: `ai-segment-${index}-${Date.now()}`,
            type: 'polygon',
            label: detection?.class_name || 'segment',
            color: getColorForClass(detection?.class_name || 'segment'),
            confidence: mask.iou_score,
            isAIGenerated: true,
            createdAt: new Date().toISOString(),
            points: mask.polygon,
          };
          annotations.push(annotation);
        }
      });
    }

    onApplyToAnnotations(annotations);
  };

  const handleApplySuggestedTags = () => {
    if (result?.suggested_tags) {
      onApplyTags(result.suggested_tags);
    }
  };

  if (isLoading) {
    return (
      <Paper className="p-4">
        <Box className="flex items-center gap-2 mb-3">
          <HiSparkles className="text-primary-500 animate-pulse" />
          <Typography variant="subtitle2">Đang phân tích với AI...</Typography>
        </Box>
        <LinearProgress />
        <Typography variant="caption" className="text-gray-500 mt-2 block">
          Phát hiện polyp, phân loại và phân đoạn hình ảnh
        </Typography>
      </Paper>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Paper className="p-4">
      <Box className="flex items-center gap-2 mb-3">
        <HiCheckCircle className="text-green-500" />
        <Typography variant="subtitle2">Kết quả phân tích AI</Typography>
      </Box>

      {/* Detection Results */}
      <Box className="mb-4">
        <Typography variant="caption" className="text-gray-500 uppercase tracking-wider">
          Phát hiện ({result.detections.length})
        </Typography>
        <Box className="flex flex-wrap gap-1 mt-1">
          {result.detections.map((detection, index) => (
            <Chip
              key={index}
              label={`${detection.class_name} (${(detection.confidence * 100).toFixed(0)}%)`}
              size="small"
              style={{
                backgroundColor: `${getColorForClass(detection.class_name)}20`,
                borderColor: getColorForClass(detection.class_name),
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            />
          ))}
          {result.detections.length === 0 && (
            <Typography variant="body2" className="text-gray-500">
              Không phát hiện tổn thương
            </Typography>
          )}
        </Box>
      </Box>

      <Divider className="my-3" />

      {/* Classification Results */}
      {result.classification && (
        <Box className="mb-4">
          <Typography variant="caption" className="text-gray-500 uppercase tracking-wider">
            Phân loại
          </Typography>
          <Box className="grid grid-cols-2 gap-2 mt-2">
            <Box className="p-2 bg-gray-50 rounded">
              <Typography variant="caption" className="text-gray-500">
                HP Status
              </Typography>
              <Typography variant="body2" className="font-medium">
                {result.classification.hp_status.class_name}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={result.classification.hp_status.confidence * 100}
                className="mt-1"
              />
            </Box>
            <Box className="p-2 bg-gray-50 rounded">
              <Typography variant="caption" className="text-gray-500">
                Loại tổn thương
              </Typography>
              <Typography variant="body2" className="font-medium">
                {result.classification.lesion_type.class_name}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={result.classification.lesion_type.confidence * 100}
                className="mt-1"
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Suggested Tags */}
      {result.suggested_tags && (
        <Box className="mb-4">
          <Typography variant="caption" className="text-gray-500 uppercase tracking-wider">
            Nhãn đề xuất
          </Typography>
          <Box className="flex flex-wrap gap-1 mt-1">
            {result.suggested_tags.tag?.map((tag, i) => (
              <Chip key={`tag-${i}`} label={tag} size="small" color="primary" variant="outlined" />
            ))}
            {result.suggested_tags.hpTag?.map((tag, i) => (
              <Chip key={`hp-${i}`} label={tag} size="small" color="secondary" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      <Divider className="my-3" />

      {/* Action Buttons */}
      <Box className="flex gap-2">
        <Button
          variant="contained"
          size="small"
          onClick={handleApplyDetections}
          disabled={result.detections.length === 0}
          startIcon={<HiSparkles />}
        >
          Áp dụng Annotations
        </Button>
        {result.suggested_tags && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleApplySuggestedTags}
          >
            Áp dụng Tags
          </Button>
        )}
      </Box>

      <Alert severity="info" className="mt-3" sx={{ py: 0 }}>
        <Typography variant="caption">
          Kết quả AI chỉ mang tính tham khảo. Vui lòng kiểm tra và chỉnh sửa nếu cần.
        </Typography>
      </Alert>
    </Paper>
  );
}

function getColorForClass(className: string): string {
  const colorMap: Record<string, string> = {
    polyp: '#FF6B6B',
    adenoma: '#4ECDC4',
    hyperplastic: '#45B7D1',
    sessile_serrated: '#96CEB4',
    ulcer: '#FFEAA7',
    inflammation: '#DDA0DD',
    normal: '#98D8C8',
  };
  return colorMap[className.toLowerCase()] || '#6366F1';
}

