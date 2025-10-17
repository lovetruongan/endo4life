import {
  CourseCriteria,
  CourseState,
} from '@endo4life/data-access';
import { BaseFilter, IFilter } from '@endo4life/types';

export interface ICourseFilter extends IFilter {
  state?: string;
  title?: string;
}

export class CourseFilter extends BaseFilter implements ICourseFilter {
  toCriteria(): CourseCriteria {
    const data: CourseCriteria = {
      title: this.getStringField('title'),
      state: this.getStringField('state') as CourseState,
    };

    for (const key of Object.keys(data)) {
      if (data[key as keyof CourseCriteria] === undefined) {
        delete data[key as keyof CourseCriteria];
      }
    }
    return data;
  }
}
