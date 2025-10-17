import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseState } from '../course.state';

export const createCourseAsync = createAsyncThunk(
  'course/createCourseAsync',
  async (_) => {
    console.log("createCourseAsync")
  },
);

export const createCourseBuilder = (
  builder: ActionReducerMapBuilder<CourseState>,
) => {
  return builder
    .addCase(createCourseAsync.pending, (state) => {
      state.creating = true;
    })
    .addCase(createCourseAsync.fulfilled, (state, action) => {
      state.creating = false;
    })
    .addCase(createCourseAsync.rejected, (state, action) => {
      state.creating = false;
    });
};
