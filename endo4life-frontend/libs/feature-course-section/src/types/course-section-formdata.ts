import { CourseState } from '@endo4life/data-access';
import {
  IImageUploadableFormData,
  imageUploadableSchema,
  IRichText,
  IVideoUploadableFormData,
  richtextSchema,
  videoUploadableSchema,
} from '@endo4life/types';
import { localUuid } from '@endo4life/util-common';
import * as yup from 'yup';

export interface ICourseSectionCreateFormData {
  courseSection: {
    courseId: string;
    state?: CourseState;
    title: string;
    tags?: string;
    tagsDetail?: string;
    totalCredits?: number;
    attribute?: IMetaDataCourseSectionDto;
  };
  thumbnail?: File;
  videoFile?: File;
}

export interface IMetaDataCourseSectionDto {
  metadata?: {
    description?: string;
    mainContent?: string;
    lessonObjectives?: string;
    target?: string;
  };
}

export interface ICourseLectureFormData {
  course: {
    title: string;
    content: string;
    aim: string;
    require: string;
    numberCertificate: number;
    description: string;
    tags?: string;
    tagsDetail?: string;
  };
  thumbnail: File;
  video: File;
}

export interface ICourseSectionFormData {
  id?: string;
  courseId?: string;
  title?: string;
  content?: IRichText;
  target?: IRichText;
  requirement?: IRichText;
  numCredits?: number;
  tags?: string[];
  detailTags?: string[];
  description?: IRichText;
  video?: IVideoUploadableFormData;
  thumbnail?: IImageUploadableFormData;
  state?: string;
  dirty?: boolean;
}

export const courseLectureScheme = yup.object({
  id: yup.string().optional().default(localUuid()),
  title: yup.string().required('Tên khoá học là trường bắt buộc'),
  content: richtextSchema.optional(),
  target: richtextSchema.optional(),
  requirement: richtextSchema.optional(),
  numCredits: yup
    .number()
    .min(0, 'Tổng số tín chỉ phải lớn hơn hoặc bằng 0')
    .max(1000, 'Tổng số tín chỉ không được vượt quá 1000')
    .optional(),
  tags: yup.array().optional(),
  detailTags: yup.array().optional(),
  description: richtextSchema.optional(),
  video: videoUploadableSchema.optional(),
  thumbnail: imageUploadableSchema.optional(),
});
