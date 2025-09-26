import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import {
  IQuestionEntity,
  QuestionBuilder,
} from '@endo4life/feature-test';
import { CourseTestsState } from '../course-tests.state';
import {
  addCourseQuestion,
  selectCourseQuestion,
} from '../../course-questions/course-questions.slice';
import { localUuid } from '@endo4life/util-common';

interface IDuplicateCourseQuestionPayload {
  testId: string;
  question: IQuestionEntity;
}

export const duplicateCourseQuestionAsync = createAsyncThunk(
  'course-tests/duplicateCourseQuestionAsync',
  async (
    { testId, question }: IDuplicateCourseQuestionPayload,
    { dispatch },
  ) => {
    if (!testId) return null;
    const newQuestion = new QuestionBuilder(question)
      .setId(localUuid())
      .build();
    dispatch(addCourseQuestion(newQuestion));
    dispatch(selectCourseQuestion(newQuestion.id));
    return { testId, question, newQuestion };
  },
);

export const duplicateCourseQuestionBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder.addCase(
    duplicateCourseQuestionAsync.fulfilled,
    (state, action) => {
      if (!action.payload) return;
      const { testId, question, newQuestion } = action.payload;
      const test = state.tests?.find((test) => test.id === testId);
      if (test) {
        const allIds = test.questionIds;
        const questionIndex = allIds.indexOf(question.id);
        allIds.splice(questionIndex + 1, 0, newQuestion.id);
        test.questionIds = allIds;
      }
    },
  );
};
