import { ITagEntity } from './tag-entity';
import { TagType } from '@endo4life/data-access';
import * as yup from 'yup';

export interface ITagFormData {
  tag?: string[];
  detailTag?: string[];
  type?: TagType;
  metadata?: ITagEntity;
}

export const tagSchema = yup.object({
  tag: yup.array().of(yup.string()).min(1, 'At least one tag is required'),
  detailTag: yup.array().of(yup.string()).optional(),
  type: yup.string().required('Tag type is required'),
});
