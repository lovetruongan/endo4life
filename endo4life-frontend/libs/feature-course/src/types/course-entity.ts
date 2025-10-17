import {
  CourseResponseDto,
  CourseState,
  ResponseDetailCourseDto,
} from '@endo4life/data-access';
import {
  BaseEntity,
  IImageUploadableEntity,
  IRichText,
} from '@endo4life/types';

export interface ICourseEntity extends BaseEntity<CourseResponseDto> {
  id: string;
  title: string;
  description?: IRichText;
  author?: string;
  tags?: string[];
  detailTags?: string[];
  thumbnail?: IImageUploadableEntity;
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
