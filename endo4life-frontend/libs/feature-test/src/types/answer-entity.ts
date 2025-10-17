import {
  BaseEntity,
  IRichText,
  richtextSchema,
} from '@endo4life/types';
import { v4 } from 'uuid';
import * as yup from 'yup';

export interface IAnswerEntity extends BaseEntity {
  id: string;
  content?: IRichText;
  isCorrect?: boolean;
  isDeleted?: boolean;
}

export interface IAnswerFormData {
  id: string;
  content?: IRichText;
  isCorrect?: boolean;
}

export const answerSchema = yup.object({
  id: yup.string().required().default(v4()),
  content: richtextSchema.optional(),
  isCorrect: yup.boolean().optional().default(false),
});
