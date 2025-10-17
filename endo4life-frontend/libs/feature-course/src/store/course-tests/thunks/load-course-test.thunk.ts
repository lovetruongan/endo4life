import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseTestsState } from '../course-tests.state';
import {
  CourseTestBuilder,
  CourseTestTypeEnum,
  ICourseTestEntity,
} from '../../../types';
import { RootState } from '../..';
import {
  selectCourseTest,
  selectCourseTestByLectureId,
  selectCourseTestByType,
} from '../course-tests.selectors';
import { CourseTestApiImpl, getAllQuestions } from '../../../api';
import { addCourseQuestions } from '../../course-questions/course-questions.slice';

interface ILoadCourseTestPayload {
  courseId: string;
  type: CourseTestTypeEnum;
  forceReload?: boolean;
}

export const loadCourseTestAsync = createAsyncThunk(
  'course-tests/loadCourseTestAsync',
  async (
    { courseId, type, forceReload }: ILoadCourseTestPayload,
    { getState, dispatch },
  ) => {
    const state = getState() as RootState;
    const existingCourseTest = selectCourseTestByType(courseId, type)(state);
    if (existingCourseTest && !forceReload) {
      return null;
    }

    let test: ICourseTestEntity | undefined;
    const api = new CourseTestApiImpl();
    try {
      test = await api.getTest(courseId, type);
      const questions = await getAllQuestions([test]);
      dispatch(addCourseQuestions(questions));
      return test;
    } catch (error) {
      test = new CourseTestBuilder(courseId, type).build();
    }

    return null;
  },
);

export const loadCourseTestBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder
    .addCase(loadCourseTestAsync.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadCourseTestAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.tests = [
          ...(state.tests?.filter((item) => item.id !== action.payload?.id) ||
            []),
          action.payload,
        ];
      }
    })
    .addCase(loadCourseTestAsync.rejected, (state, action) => {
      state.loading = false;
    });
};
