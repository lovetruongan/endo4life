import { CourseSectionResponseDto } from '@endo4life/data-access';
import {
  BaseEntity,
  IImageUploadableEntity,
  IRichText,
  IVideoUploadableEntity,
} from '@endo4life/types';

export interface ICourseSectionEntity
  extends BaseEntity<CourseSectionResponseDto> {
  id: string;
  title?: string;
  content?: IRichText;
  target?: IRichText;
  requirement?: IRichText;
  numCredits?: number;
  tags?: string[];
  detailTags?: string[];
  description?: IRichText;
  video?: IVideoUploadableEntity;
  thumbnail?: IImageUploadableEntity;
  state?: string;
}
