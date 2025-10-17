import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseTestsState } from '../course-tests.state';
import { CourseTestBuilder, CourseTestTypeEnum } from '../../../types';
import { RootState } from '../..';
import { selectCourseTestByLectureId } from '../course-tests.selectors';

interface ILoadCourseLectureTestPayload {
  courseId: string;
  lectureId: string;
}

export const loadCourseLectureTestAsync = createAsyncThunk(
  'course-tests/loadCourseLectureTestAsync',
  async (
    { courseId, lectureId }: ILoadCourseLectureTestPayload,
    { getState, dispatch },
  ) => {
    const state = getState() as RootState;
    const existingCourseTest = selectCourseTestByLectureId(lectureId)(state);
    if (existingCourseTest) return { existingTest: existingCourseTest };
    const newCouseTest = new CourseTestBuilder(
      courseId,
      CourseTestTypeEnum.LECTURE_REVIEW_QUESTIONS_COURSE,
    );
    newCouseTest.courseSectionId = lectureId;
    return { newTest: newCouseTest.build() };
  },
);

export const loadCourseLectureTestBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder
    .addCase(loadCourseLectureTestAsync.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadCourseLectureTestAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload?.newTest) {
        state.tests = [...(state.tests || []), action.payload.newTest];
      }
    })
    .addCase(loadCourseLectureTestAsync.rejected, (state, action) => {
      state.loading = false;
    });
};
