import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseTestsState } from '../course-tests.state';
import { QuestionBuilder } from '@endo4life/feature-test';
import { addCourseQuestion } from '../../course-questions/course-questions.slice';

interface IAddNewCourseQuestionPayload {
  testId: string;
}

export const addNewCourseQuestionAsync = createAsyncThunk(
  'course-tests/addNewCourseQuestionAsync',
  async ({ testId }: IAddNewCourseQuestionPayload, { dispatch }) => {
    if (!testId) return null;
    const newQuestion = new QuestionBuilder().build();
    dispatch(addCourseQuestion(newQuestion));
    return { testId, question: newQuestion };
  },
);

export const addNewCourseQuestionBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder.addCase(
    addNewCourseQuestionAsync.fulfilled,
    (state, action) => {
      if (!action.payload) return;
      const { testId, question } = action.payload;
      const test = state.tests?.find((test) => test.id === testId);
      if (test) test.questionIds.push(question.id.toString());
    },
  );
};
