import { ITagEntity } from './tag-entity';

import * as yup from 'yup';

export interface ITagFormData extends ITagEntity {
  metadata?: ITagEntity;
}

export const tagSchema = yup.object({
  id: yup.string().optional(),
  content: yup.string().optional(),
});
