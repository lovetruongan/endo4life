import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseTestsState } from '../course-tests.state';
import { deleteCourseQuestion } from '../../course-questions/course-questions.slice';
import { isLocalUuid } from '@endo4life/util-common';

interface IDeleteCourseQuestionPayload {
  testId: string;
  questionId: string;
}

export const deleteCourseQuestionAsync = createAsyncThunk(
  'course-tests/deleteCourseQuestionAsync',
  async (
    { testId, questionId }: IDeleteCourseQuestionPayload,
    { dispatch },
  ) => {
    if (!questionId) return null;
    dispatch(deleteCourseQuestion(questionId));
    return { testId, questionId };
  },
);

export const deleteCourseQuestionBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder.addCase(
    deleteCourseQuestionAsync.fulfilled,
    (state, action) => {
      if (!action.payload) return;
      const { testId, questionId } = action.payload;
      const test = state.tests?.find((test) => test.id === testId);
      if (test && isLocalUuid(questionId)) {
        test.questionIds = test.questionIds.filter(
          (item) => item !== questionId,
        );
      }
    },
  );
};
