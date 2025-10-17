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
      const tests =
        state.tests?.filter((item) => {
          return !action.payload.find((test) => test.id === item.id);
        }) || [];
      state.tests = [...tests, ...action.payload];
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    courseTestsReducerBuider(builder);
  },
});

export const { resetCourseTestsState, addCourseTests } = slice.actions;

export const courseTestsReducer = slice.reducer;
