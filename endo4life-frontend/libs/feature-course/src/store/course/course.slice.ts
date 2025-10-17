import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CourseState, INITIAL_COURSE_STATE } from './course.state';
import { courseReducerBuilder } from './course.thunk';
import { ICourseFormData } from '../../types';

const SLICE_NAME: string = 'course';

const slice = createSlice({
  name: SLICE_NAME,
  initialState: INITIAL_COURSE_STATE,
  reducers: {
    resetCourseState: (state: CourseState) => {
      Object.assign(state, INITIAL_COURSE_STATE);
    },

    updateCourse: (
      state: CourseState,
      action: PayloadAction<Partial<ICourseFormData>>,
    ) => {
      if (state.course) {
        state.course = { ...state.course, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    courseReducerBuilder(builder);
  },
});

export const { resetCourseState, updateCourse } = slice.actions;

export const courseReducer = slice.reducer;
