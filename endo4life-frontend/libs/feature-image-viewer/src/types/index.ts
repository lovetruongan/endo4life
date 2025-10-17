import { BaseEntity } from '@endo4life/types';

export interface IImageEntity extends BaseEntity {
  src: string;
  width?: number;
  height?: number;
}

export enum AnnotationType {
  BBOX = 'BBOX',
  POLYGON = 'POLYGON',
  POLYLINE = 'POLYLINE',
  CIRCLE = 'CIRCLE',
  ELLIPSE = 'ELLIPSE',
  LINE = 'LINE',
  TEXT = 'TEXT',
}

export interface BaseAnnotationEntity {
  id: string;
  type?: AnnotationType;
  hidden?: boolean;
  label?: string;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
}

export interface IBBoxAnnotationEntity extends BaseAnnotationEntity {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ICircleAnnotationEntity extends BaseAnnotationEntity {
  x: number;
  y: number;
  radius: number;
}
export interface IEllipseAnnotationEntity extends BaseAnnotationEntity {
  x: number;
  y: number;
  rx: number;
  ry: number;
}
export interface ILineAnnotationEntity extends BaseAnnotationEntity {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface IPolygonAnnotationEntity extends BaseAnnotationEntity {
  points: { x: number; y: number }[];
}

export interface IPolylineAnnotationEntity extends BaseAnnotationEntity {
  points: { x: number; y: number }[];
}

export interface ITextAnnotationEntity extends BaseAnnotationEntity {
  text?: string;
  x?: number;
  y?: number;
}

export type IAnnotationEntity =
  | IBBoxAnnotationEntity
  | IPolygonAnnotationEntity
  | IPolylineAnnotationEntity
  | ITextAnnotationEntity
  | ICircleAnnotationEntity
  | IEllipseAnnotationEntity
  | ILineAnnotationEntity;
