import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CourseQuestionsState,
  INITIAL_COURSE_QUESTIONS_STATE,
} from './course-questions.state';
import { IQuestionEntity } from '@endo4life/feature-test';

const SLICE_NAME: string = 'course-questions';

const slice = createSlice({
  name: SLICE_NAME,
  initialState: INITIAL_COURSE_QUESTIONS_STATE,
  reducers: {
    resetCourseQuestionsState: (state: CourseQuestionsState) => {
      Object.assign(state, INITIAL_COURSE_QUESTIONS_STATE);
    },
    completeEditingQuestion: (state: CourseQuestionsState) => {
      const question = state.editingQuestion;
      if (question) {
        state.questions[question.id] = { ...question };
      }
    },
    selectCourseQuestion: (
      state: CourseQuestionsState,
      action: PayloadAction<string>,
    ) => {
      const questionId = action.payload;
      if (state.questions.hasOwnProperty(questionId)) {
        if (state.editingQuestion && questionId !== state.editingQuestion?.id) {
          state.questions[state.editingQuestion.id] = state.editingQuestion;
        }
        state.editingQuestion = state.questions[questionId];
      }
    },
    addCourseQuestions: (
      state: CourseQuestionsState,
      action: PayloadAction<IQuestionEntity[]>,
    ) => {
      for (const question of action.payload) {
        state.questions[question.id.toString()] = question;
      }
      state.loading = false;
    },
    updateCourseQuestion: (
      state: CourseQuestionsState,
      action: PayloadAction<IQuestionEntity>,
    ) => {
      const question = action.payload;
      state.questions[question.id] = question;
      if (action.payload.id === state.editingQuestion?.id) {
        state.editingQuestion = {
          ...state.editingQuestion,
          ...action.payload,
        };
      }
    },
    updateEditingQuestion: (
      state: CourseQuestionsState,
      action: PayloadAction<IQuestionEntity>,
    ) => {
      const question = action.payload;
      if (question.id === state.editingQuestion?.id) {
        state.editingQuestion = { ...state.editingQuestion, ...question };
      }
    },
    addCourseQuestion: (
      state: CourseQuestionsState,
      action: PayloadAction<IQuestionEntity>,
    ) => {
      const question = action.payload;
      state.questions[question.id.toString()] = question;
      if (state.editingQuestion) {
        state.questions[state.editingQuestion.id] = {
          ...state.editingQuestion,
        };
      }
      state.editingQuestion = { ...question };
    },
    deleteCourseQuestion: (
      state: CourseQuestionsState,
      action: PayloadAction<string>,
    ) => {
      state.questions[action.payload].isDeleted = true;
      if (action.payload === state.editingQuestion?.id) {
        state.editingQuestion = undefined;
      }
    },
  },
});

export const {
  resetCourseQuestionsState,
  addCourseQuestions,
  addCourseQuestion,
  updateCourseQuestion,
  updateEditingQuestion,
  deleteCourseQuestion,
  selectCourseQuestion,
  completeEditingQuestion,
} = slice.actions;

export const courseQuestionsReducer = slice.reducer;
