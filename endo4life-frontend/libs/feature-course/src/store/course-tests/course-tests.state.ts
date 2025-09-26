import { ICourseTestEntity } from '../../types';

export interface CourseTestsState {
  loading: boolean;
  saving?: boolean;
  tests?: ICourseTestEntity[];
}

export const INITIAL_COURSE_TESTS_STATE: CourseTestsState = {
  loading: true,
  saving: false,
  tests: [],
};
