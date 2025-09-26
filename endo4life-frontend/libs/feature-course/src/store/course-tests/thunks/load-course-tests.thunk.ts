import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseTestsState } from '../course-tests.state';
import { CourseQuestionMapper, CourseTestApiImpl } from '../../../api';
import { IQuestionEntity } from '@endo4life/feature-test';
import { addCourseQuestions } from '../../course-questions/course-questions.slice';
import {
  CourseTestBuilder,
  CourseTestTypeEnum,
  ICourseTestEntity,
} from '../../../types';

async function getCourseTest(courseId: string, type: CourseTestTypeEnum) {
  let test: ICourseTestEntity | undefined;
  const api = new CourseTestApiImpl();
  try {
    test = await api.getTest(courseId, type);
  } catch (error) {
    test = new CourseTestBuilder(courseId, type).build();
  }
  return test;
}

interface ILoadCourseTestsPayload {
  courseId: string;
}

export const loadCourseTestsAsync = createAsyncThunk(
  'course-tests/loadCourseTestsAsync',
  async ({ courseId }: ILoadCourseTestsPayload, { dispatch }) => {
    const entranceTest = await getCourseTest(
      courseId,
      CourseTestTypeEnum.ENTRANCE_TEST_COURSE,
    );
    const surveyTest = await getCourseTest(
      courseId,
      CourseTestTypeEnum.SURVEY_COURSE,
    );
    const finalTest = await getCourseTest(
      courseId,
      CourseTestTypeEnum.FINAL_EXAM_COURSE,
    );
    const allQuestions: IQuestionEntity[] = [];
    const questionMapper = new CourseQuestionMapper();
    for (const questionDto of entranceTest.metadata?.questions || []) {
      const question = questionMapper.fromDto(questionDto);
      allQuestions.push(question);
    }
    dispatch(addCourseQuestions(allQuestions));
    return [entranceTest, surveyTest, finalTest];
  },
);

export const loadCourseTestsBuilder = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  return builder
    .addCase(loadCourseTestsAsync.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadCourseTestsAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.tests = [...(state.tests || []), ...action.payload];
      }
    })
    .addCase(loadCourseTestsAsync.rejected, (state, action) => {
      state.loading = false;
    });
};
