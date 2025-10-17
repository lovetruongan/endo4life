import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { loadCourseTestsBuilder } from './thunks/load-course-tests.thunk';
import { CourseTestsState } from './course-tests.state';
import { addNewCourseQuestionBuilder } from './thunks/add-new-course-question.thunk';
import { duplicateCourseQuestionBuilder } from './thunks/duplicate-course-question.thunk';
import { deleteCourseQuestionBuilder } from './thunks/delete-course-question.thunk';
import { loadCourseLectureTestBuilder } from './thunks/load-course-lecture-test.thunk';
import { saveCourseTestBuilder } from './thunks/save-course-test.thunk';
import { loadCourseTestBuilder } from './thunks/load-course-test.thunk';

export const courseTestsReducerBuider = (
  builder: ActionReducerMapBuilder<CourseTestsState>,
) => {
  loadCourseTestsBuilder(builder);
  addNewCourseQuestionBuilder(builder);
  duplicateCourseQuestionBuilder(builder);
  deleteCourseQuestionBuilder(builder);
  loadCourseLectureTestBuilder(builder);
  saveCourseTestBuilder(builder);
  loadCourseTestBuilder(builder);
};
