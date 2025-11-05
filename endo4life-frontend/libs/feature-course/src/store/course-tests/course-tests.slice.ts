import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CourseTestsState,
  INITIAL_COURSE_TESTS_STATE,
} from './course-tests.state';
import { courseTestsReducerBuider } from './course-tests.thunk';
import { ICourseTestEntity } from '../../types';

const SLICE_NAME: string = 'course-tests';

const slice = createSlice({
  name: SLICE_NAME,
  initialState: INITIAL_COURSE_TESTS_STATE,
  reducers: {
    resetCourseTestsState: (state: CourseTestsState) => {
      Object.assign(state, INITIAL_COURSE_TESTS_STATE);
    },
    addCourseTests: (
      state: CourseTestsState,
      action: PayloadAction<ICourseTestEntity[]>,
    ) => {
      console.log('addCourseTests - incoming tests:', action.payload.map(t => ({
        id: t.id,
        courseSectionId: t.courseSectionId,
        questionIds: t.questionIds,
        isNew: t.isNew,
      })));
      
      // For lecture review tests, also remove any existing tests with the same courseSectionId
      const tests =
        state.tests?.filter((item) => {
          const isDuplicate = action.payload.find((test) => test.id === item.id);
          const isSameLecture = action.payload.find((test) => 
            test.courseSectionId && 
            test.courseSectionId === item.courseSectionId &&
            test.type === 'LECTURE_REVIEW_QUESTIONS_COURSE'
          );
          return !isDuplicate && !isSameLecture;
        }) || [];
      
      console.log('addCourseTests - filtered tests:', tests.map(t => ({
        id: t.id,
        courseSectionId: t.courseSectionId,
        questionIds: t.questionIds,
      })));
      
      state.tests = [...tests, ...action.payload];
      state.loading = false;
      
      console.log('addCourseTests - final state:', state.tests.map(t => ({
        id: t.id,
        courseSectionId: t.courseSectionId,
        questionIds: t.questionIds,
      })));
    },
  },
  extraReducers: (builder) => {
    courseTestsReducerBuider(builder);
  },
});

export const { resetCourseTestsState, addCourseTests } = slice.actions;

export const courseTestsReducer = slice.reducer;
