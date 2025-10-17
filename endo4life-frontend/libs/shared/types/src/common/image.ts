import { v4 } from 'uuid';
import * as yup from 'yup';
import { BaseEntity } from './entity';
export interface IImageUploadableEntity extends BaseEntity {
  id: string;
  src?: string;
  width?: number;
  height?: number;
  fileName?: string;
  fileSize?: number;
  extension?: string;
  base64?: string;
  file?: File;
  uploadResponse?: {
    id?: string,
    objectKey: string;
    bucket: string;
    width: number;
    height: number;
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

export interface IImageUploadableFormData {
  id?: string;
  src?: string;
  width?: number;
  height?: number;
  fileName?: string;
  fileSize?: number;
  extension?: string;
  file?: File;
  base64?: string;
}
export const imageUploadableSchema = yup.object({
  id: yup.string().optional(),
  src: yup.string().optional(),
  width: yup.number().optional(),
  height: yup.number().optional(),
  fileName: yup.string().optional(),
  fileSize: yup.number().optional(),
  extension: yup.string().optional(),
  file: yup.mixed(),
  base64: yup.string().optional(),
});
