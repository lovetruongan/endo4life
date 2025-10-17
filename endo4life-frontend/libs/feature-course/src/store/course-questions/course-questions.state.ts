import { IQuestionEntity } from '@endo4life/feature-test';

export interface CourseQuestionsState {
  loading: boolean;
  questions: Record<string, IQuestionEntity>;
  editingQuestion?: IQuestionEntity;
  hasPendingChanges?: boolean;
}

export const INITIAL_COURSE_QUESTIONS_STATE: CourseQuestionsState = {
  loading: true,
  questions: {},
  editingQuestion: undefined,
  hasPendingChanges: false,
};
