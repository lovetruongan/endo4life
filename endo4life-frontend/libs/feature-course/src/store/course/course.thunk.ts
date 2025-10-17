import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { CourseState } from './course.state';
import { loadCourseBuilder } from './thunks/load-course.thunk';
import { saveCourseBuilder } from './thunks/save-course.thunk';
import { createCourseBuilder } from './thunks/create-course.thunk';

export const courseReducerBuilder = (
  builder: ActionReducerMapBuilder<CourseState>,
) => {
  loadCourseBuilder(builder);
  saveCourseBuilder(builder);
  createCourseBuilder(builder);
};
