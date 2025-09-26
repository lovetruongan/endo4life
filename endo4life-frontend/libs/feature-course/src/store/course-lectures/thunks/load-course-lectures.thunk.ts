import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseLecturesState } from '../course-lectures.state';
import { IFilter } from '@endo4life/types';
import { CourseSectionApiImpl } from '@endo4life/feature-course-section';

interface ILoadCourseInfoPayload {
  courseId: string;
  filter: IFilter;
}

export const loadCourseLecturesAsync = createAsyncThunk(
  'course-lectures/loadCourseLecturesAsync',
  async ({ courseId, filter }: ILoadCourseInfoPayload, {}) => {
    if (!courseId) return null;
    const api = new CourseSectionApiImpl();
    const response = await api.getCourseSections(filter);
    return { filter, ...response };
  },
);

export const loadCourseLecturesBuilder = (
  builder: ActionReducerMapBuilder<CourseLecturesState>,
) => {
  return builder
    .addCase(loadCourseLecturesAsync.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadCourseLecturesAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.filter = action.payload.filter;
        state.lectures = action.payload.data;
        state.pagination = action.payload.pagination;
        if (state.pagination) state.pagination.page++;
      }
    })
    .addCase(loadCourseLecturesAsync.rejected, (state, action) => {
      state.loading = false;
    });
};
