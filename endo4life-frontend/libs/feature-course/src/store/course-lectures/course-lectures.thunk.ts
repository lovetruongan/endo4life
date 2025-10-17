import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { CourseLecturesState } from './course-lectures.state';
import { loadCourseLecturesBuilder } from './thunks/load-course-lectures.thunk';
import { loadCourseLectureDetailBuilder } from './thunks/load-course-lecture-detail.thunk';

export const courseLecturesReducerBuider = (
  builder: ActionReducerMapBuilder<CourseLecturesState>,
) => {
  loadCourseLecturesBuilder(builder);
  loadCourseLectureDetailBuilder(builder);
};
