import { ICourseEntity } from '../../types';

export interface CourseState {
  loading: boolean;
  saving?: boolean;
  creating?: boolean;
  course?: ICourseEntity;
}

export const INITIAL_COURSE_STATE: CourseState = {
  loading: true,
  saving: false,
  creating: false,
  course: undefined,
};
