import { BaseFilter, IFilter } from '@endo4life/types';
import {
  CourseCriteria,
  CourseState,
} from '@endo4life/data-access';

export interface ICourseFilter extends IFilter {}

export class CourseFilter extends BaseFilter implements ICourseFilter {
  toCriteria(): CourseCriteria {
    const data: CourseCriteria = {
      title: this.getStringField('title'),
      state: this.getStringField('state') as CourseState,
      // tags: this.getArrayStringField('tags'),
      // tagsDetail: this.getArrayStringField('tagsDetail'),
    };

    Object.keys(data).forEach((key) => {
      if (data[key as keyof CourseCriteria] === undefined) {
        delete data[key as keyof CourseCriteria];
      }
    });

    return data;
  }
}
