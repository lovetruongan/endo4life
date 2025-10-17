import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseState } from '../course.state';
import { CourseTestApiImpl } from '../../../api';
import { selectCourseTests } from '../../course-tests/course-tests.selectors';
import { RootState } from '../..';
import { selectCourseQuestions } from '../../course-questions/course-questions.selectors';
import { isLocalUuid } from '@endo4life/util-common';

interface ISaveCoursePayload {
  courseId: string;
}

export const saveCourseAsync = createAsyncThunk(
  'course/saveCourseAsync',
  async ({ courseId }: ISaveCoursePayload, { getState }) => {
    if (!courseId) return null;
    const state = getState() as RootState;
    const courseTestApi = new CourseTestApiImpl();
    const courseTests = selectCourseTests(courseId)(state);
    const courseQuestions = selectCourseQuestions(state);
    // create or update course tests

    for (const test of courseTests || []) {
      try {
        if (isLocalUuid(test.id)) {
          await courseTestApi.createTest(test, courseQuestions);
        } else {
          await courseTestApi.updateTest(test, courseQuestions);
        }
      } catch (error) {
        console.log('ERROR', error);
      }
    }
  },
);

export const saveCourseBuilder = (
  builder: ActionReducerMapBuilder<CourseState>,
) => {
  return builder
    .addCase(saveCourseAsync.pending, (state) => {
      state.saving = true;
    })
    .addCase(saveCourseAsync.fulfilled, (state, action) => {
      state.saving = false;
    })
    .addCase(saveCourseAsync.rejected, (state, action) => {
      state.saving = false;
    });
};
