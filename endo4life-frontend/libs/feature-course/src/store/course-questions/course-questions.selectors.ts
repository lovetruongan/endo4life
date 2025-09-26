import { RootState } from '..';

export const selectCourseQuestionsIsLoading = (state: RootState) => {
  return state.questions.loading;
};

export const selectCourseQuestions = (state: RootState) => {
  return state.questions.questions;
};

export const selectEditingQuestion = (state: RootState) => {
  return state.questions.editingQuestion;
};
