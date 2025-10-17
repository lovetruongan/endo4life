import { v4 } from 'uuid';
import * as yup from 'yup';
import { BaseEntity } from './entity';

export interface IVideoUploadableEntity extends BaseEntity {
  id: string;
  src?: string;
  fileName?: string;
  fileSize?: number;
  extension?: string;
  file?: File;
}

export interface IVideoUploadableFormData {
  id?: string;
  src?: string;
  fileName?: string;
  fileSize?: number;
  extension?: string;
  file?: File;
}
export const videoUploadableSchema = yup.object({
  id: yup.string().optional(),
  src: yup.string().optional(),
  fileName: yup.string().optional(),
  fileSize: yup.number().optional(),
  extension: yup.string().optional(),
  file: yup.mixed(),
});
