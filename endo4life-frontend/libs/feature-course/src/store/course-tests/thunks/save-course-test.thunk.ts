import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseTestsState } from '../course-tests.state';
import { RootState } from '../..';
import { selectCourseTestById } from '../course-tests.selectors';
import { selectCourseQuestions } from '../../course-questions/course-questions.selectors';
import { isLocalUuid } from '@endo4life/util-common';
import { CourseTestApiImpl, getAllQuestions } from '../../../api';
import {
  addCourseQuestions,
  completeEditingQuestion,
} from '../../course-questions/course-questions.slice';
import { loadCourseLectureDetailAsync } from '../../course-lectures/thunks/load-course-lecture-detail.thunk';

export const saveCourseTestAsync = createAsyncThunk(
  'course-tests/saveCourseTestAsync',
  async ({ testId }: { testId: string }, { dispatch, getState }) => {
    if (!testId) return null;
    dispatch(completeEditingQuestion());
    const state = getState() as RootState;
    const test = selectCourseTestById(testId)(state);
    const courseQuestions = selectCourseQuestions(state);
    const courseTestApi = new CourseTestApiImpl();
    if (!test) return null;
    let id: string | undefined;
    if (isLocalUuid(test.id)) {
      id = await courseTestApi.createTest(test, courseQuestions);
    } else {
      await courseTestApi.updateTest(test, courseQuestions);
      id = test.id;
    }
    if (test.courseSectionId) {
      await dispatch(
        loadCourseLectureDetailAsync({
          courseId: test.courseId,
          lectureId: test.courseSectionId,
          forceReload: true,
        }),
      );
      return null;
    } else {
      const newTest = await courseTestApi.getTest(test.courseId, test.type);
      const questions = await getAllQuestions([newTest]);
      dispatch(addCourseQuestions(questions));
      return newTest;
    }
  },
);

export const saveCourseTestBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder.addCase(saveCourseTestAsync.fulfilled, (state, action) => {
    if (!action.payload) return;
    state.tests = [
      ...(state.tests?.filter((item) => item.id !== action.payload?.id) || []),
      action.payload,
    ];
  });
};
