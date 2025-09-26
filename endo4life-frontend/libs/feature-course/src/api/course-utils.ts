import { IQuestionEntity } from '@endo4life/feature-test';
import {
  CourseTestBuilder,
  CourseTestTypeEnum,
  ICourseTestEntity,
} from '../types';
import { CourseTestApiImpl } from './course-test-api';
import { CourseQuestionMapper } from './course-question-mapper';
import { isLocalUuid } from '@endo4life/util-common';

export async function getCourseTest(
  courseId: string,
  type: CourseTestTypeEnum,
) {
  if (isLocalUuid(courseId)) {
    return new CourseTestBuilder(courseId, type).build();
  }

  let test: ICourseTestEntity | undefined;
  const api = new CourseTestApiImpl();
  try {
    test = await api.getTest(courseId, type);
  } catch (error) {
    test = new CourseTestBuilder(courseId, type).build();
  }
  return test;
}

export async function getAllTests(courseId: string) {
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

  return [entranceTest, surveyTest, finalTest];
}

export async function getAllQuestions(tests: ICourseTestEntity[]) {
  const allQuestions: IQuestionEntity[] = [];
  const questionMapper = new CourseQuestionMapper();
  for (const test of tests) {
    for (const questionDto of test.metadata?.questions || []) {
      const question = questionMapper.fromDto(questionDto);
      allQuestions.push(question);
    }
  }
  return allQuestions;
}
