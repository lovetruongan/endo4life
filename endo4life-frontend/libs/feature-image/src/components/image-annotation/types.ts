/**
 * Types for image annotation system
 */

export type AnnotationToolType = 'select' | 'bbox' | 'polygon' | 'point';

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaseAnnotation {
  id: string;
  label: string;
  color: string;
  confidence?: number;
  isAIGenerated?: boolean;
  createdAt: string;
}

export interface BoundingBoxAnnotation extends BaseAnnotation {
  type: 'bbox';
  bbox: BoundingBox;
}

export interface PolygonAnnotation extends BaseAnnotation {
  type: 'polygon';
  points: Point[];
}

export interface PointAnnotation extends BaseAnnotation {
  type: 'point';
  point: Point;
}

export type Annotation = BoundingBoxAnnotation | PolygonAnnotation | PointAnnotation;

export interface AnnotationState {
  annotations: Annotation[];
  selectedId: string | null;
  currentTool: AnnotationToolType;
  isDrawing: boolean;
  currentLabel: string;
}

export interface AIAnalysisResult {
  detections: Array<{
    class_name: string;
    confidence: number;
    bbox: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  }>;
  classification?: {
    hp_status: {
      class_name: string;
      confidence: number;
    };
    lesion_type: {
      class_name: string;
      confidence: number;
    };
  };
  segmentation?: {
    masks: Array<{
      detection_index: number;
      polygon: Point[];
      area: number;
      iou_score: number;
    }>;
  };
  suggested_tags?: {
    tag: string[];
    detailTag: string[];
    hpTag: string[];
  };
}

// Label presets for endoscopy
export const ENDOSCOPY_LABELS = [
  { value: 'polyp', label: 'Polyp', color: '#FF6B6B' },
  { value: 'adenoma', label: 'Adenoma', color: '#4ECDC4' },
  { value: 'hyperplastic', label: 'Hyperplastic', color: '#45B7D1' },
  { value: 'sessile_serrated', label: 'Sessile Serrated', color: '#96CEB4' },
  { value: 'ulcer', label: 'Ulcer', color: '#FFEAA7' },
  { value: 'inflammation', label: 'Inflammation', color: '#DDA0DD' },
  { value: 'normal', label: 'Normal', color: '#98D8C8' },
] as const;

export type EndoscopyLabelValue = typeof ENDOSCOPY_LABELS[number]['value'];

