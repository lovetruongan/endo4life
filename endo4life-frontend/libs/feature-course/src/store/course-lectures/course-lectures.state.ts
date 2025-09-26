import { IFilter, IPagination } from '@endo4life/types';
import { ICourseSectionEntity, ICourseSectionFormData } from '@endo4life/feature-course-section';

export interface CourseLecturesState {
  loading: boolean;
  lectures?: ICourseSectionEntity[];
  lectureDetails: Record<string, ICourseSectionFormData>;
  filter?: IFilter;
  pagination?: IPagination;
}

export const INITIAL_COURSE_LECTURES_STATE: CourseLecturesState = {
  loading: true,
  lectures: [],
  lectureDetails: {},
};
