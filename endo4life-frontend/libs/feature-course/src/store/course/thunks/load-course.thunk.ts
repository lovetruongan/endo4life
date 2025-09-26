import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseState } from '../course.state';
import { CourseApiImpl, getAllQuestions, getAllTests } from '../../../api';
import { addCourseQuestions } from '../../course-questions/course-questions.slice';
import { addCourseTests } from '../../course-tests/course-tests.slice';
import { isLocalUuid } from '@endo4life/util-common';
import { CourseMapper } from '../../../types';

interface ILoadCoursePayload {
  courseId: string;
}

export const loadCourseAsync = createAsyncThunk(
  'course/loadCourseAsync',
  async ({ courseId }: ILoadCoursePayload, { dispatch }) => {
    if (!courseId) return null;
    if (isLocalUuid(courseId)) {
      return { id: courseId, title: '' };
    }
    const course = await new CourseApiImpl().getCourseById(courseId);
    const tests = await getAllTests(courseId);
    const questions = await getAllQuestions(tests);
    dispatch(addCourseTests(tests));
    dispatch(addCourseQuestions(questions));
    return course;
  },
);

export const loadCourseBuilder = (
  builder: ActionReducerMapBuilder<CourseState>,
) => {
  return builder
    .addCase(loadCourseAsync.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadCourseAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) state.course = action.payload;
    })
    .addCase(loadCourseAsync.rejected, (state, action) => {
      state.loading = false;
    });
};
