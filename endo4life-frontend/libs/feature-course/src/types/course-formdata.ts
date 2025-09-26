import { CourseState } from '@endo4life/data-access';
import {
  IImageUploadableFormData,
  imageUploadableSchema,
  IRichText,
  richtextSchema,
} from '@endo4life/types';
import * as yup from 'yup';
export interface ICourseInfoFormData {
  id?: string;
  course: {
    state?: CourseState;
    title: string;
    description: string;
    lecturer: string;
    tags?: string;
    tagsDetail?: string;
  };
  thumbnail?: File;
  thumbnailUrl?: string;
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

export interface ICourseFormData {
  id?: string;
  title: string;
  description?: IRichText;
  author?: string;
  state?: string;
  tags?: string[];
  detailTags?: string[];
  thumbnail?: IImageUploadableFormData;
}

export const courseScheme = yup.object({
  id: yup.string().optional(),
  title: yup.string().required('Tên khoá học là trường bắt buộc'),
  description: richtextSchema.required('Mô tả khoá học là trường bắt buộc'),
  author: yup.string().required('Giảng viên là trường bắt buộc'),
  state: yup.string().optional().default('UNLISTED'),
  tags: yup.array().optional(),
  detailTags: yup.array().optional(),
  thumbnail: imageUploadableSchema.optional(),
});
