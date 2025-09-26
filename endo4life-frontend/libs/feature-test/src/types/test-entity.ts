import {
  BaseEntity,
  IRichText,
  richtextSchema,
} from '@endo4life/types';
import {
  IQuestionEntity,
  IQuestionFormData,
  questionSchema,
} from './question-entity';
import * as yup from 'yup';
import { v4 } from 'uuid';

export interface ITestEntity extends BaseEntity {
  id: string;
  title?: string;
  description?: IRichText;
  type?: string;
  questions: IQuestionEntity[];
}

export interface ITestFormData {
  id: string;
  title: string;
  description?: IRichText;
  type?: string;
  questions?: IQuestionFormData;
}

export const testSchema = yup.object({
  id: yup.string().required().default(v4()),
  title: yup.string().optional(),
  description: richtextSchema.optional(),
  type: yup.string().optional(),
  questions: yup.array().of(questionSchema).optional(),
});
