import { RootState } from '..';

export const selectCourseIsLoading = (state: RootState) => {
  return state.course.loading;
};

export const selectCourseIsSaving = (state: RootState) => {
  return state.course.saving;
};

export const selectCourseIsCreating = (state: RootState) => {
  return state.course.creating;
};

export const selectCourse = (state: RootState) => {
  return state.course.course;
};
