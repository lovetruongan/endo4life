import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseTestsState } from '../course-tests.state';

interface ISaveCourseTestPayload {
  courseId: string;
}

export const saveCourseTestsAsync = createAsyncThunk(
  'course-tests/saveCourseTestsAsync',
  async ({ courseId }: ISaveCourseTestPayload) => {
    console.log('saveCourseTest', courseId);
    return [];
  },
);

export const saveCourseTestsBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder
    .addCase(saveCourseTestsAsync.pending, (state) => {
      state.saving = true;
    })
    .addCase(saveCourseTestsAsync.fulfilled, (state, action) => {
      if (action.payload) {
        state.tests = [...(state.tests || []), ...action.payload];
      }
      state.saving = false;
    })
    .addCase(saveCourseTestsAsync.rejected, (state, action) => {
      state.loading = false;
      state.saving = false;
    });
};
