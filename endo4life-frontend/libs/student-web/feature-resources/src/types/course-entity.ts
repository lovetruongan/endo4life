import {
  CourseResponseDto,
  CourseState,
  ResponseDetailCourseDto,
} from '@endo4life/data-access';
import { BaseEntity } from '@endo4life/types';

export interface ICourseEntity extends BaseEntity<CourseResponseDto> {
  id: string;
  title?: string;
  state?: CourseState;
  description?: string;
  thumbnailUrl?: string;
  lastUpdated?: string;
  tags?: string[];
  tagsDetail?: string[];
}

export interface ICourseDetailEntity
  extends BaseEntity<ResponseDetailCourseDto> {
  id: string;
  title?: string;
  state?: CourseState;
  thumbnailUrl?: string;
  lastUpdated?: string;
  tags?: string[];
  tagsDetail?: string[];
  lecturer?: string;
  description?: string;
}
