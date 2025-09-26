import { RootState } from '..';
import { selectCourseQuestions } from '../course-questions/course-questions.selectors';

export const selectCourseTestsIsLoading = (state: RootState) => {
  return state.tests.loading;
};

export const selectCourseTests = (courseId: string) => (state: RootState) => {
  return state.tests.tests?.filter((item) => item.courseId === courseId);
};

export const selectCourseTestByType =
  (courseId: string, type: string) => (state: RootState) => {
    const allTests = state.tests.tests || [];
    return allTests.find(
      (test) => test.type === type && test.courseId === courseId,
    );
  };

export const selectCourseTest =
  (courseId: string, type: string, testId?: string) => (state: RootState) => {
    const allTests = state.tests.tests || [];
    if (testId) {
      return allTests.find(({ id }) => id.toString() === testId);
    }
    return allTests.find(
      (test) => test.type === type && test.courseId === courseId,
    );
  };

export const selectCourseTestById = (testId: string) => (state: RootState) => {
  return state.tests.tests?.find((test) => test.id.toString() === testId);
};

export const selectCourseTestByLectureId =
  (lectureId: string) => (state: RootState) => {
    return state.tests.tests?.find(
      (test) => test.courseSectionId?.toString() === lectureId,
    );
  };

export const selectCourseTestQuestions =
  (courseId: string, type: string, testId?: string) => (state: RootState) => {
    const courseTest = selectCourseTest(courseId, type, testId)(state);
    if (!courseTest) return [];
    const questions = selectCourseQuestions(state);
    return courseTest.questionIds.map((questionId) => questions[questionId]);
  };
