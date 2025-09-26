import {
  CourseSectionCriteria,
  CourseState,
} from '@endo4life/data-access';
import { BaseFilter, IFilter } from '@endo4life/types';

export interface ICourseSectionFilter extends IFilter {
  state?: string;
  title?: string;
}

export class CourseSectionFilter
  extends BaseFilter
  implements ICourseSectionFilter
{
  toCriteria(): CourseSectionCriteria {
    const data: CourseSectionCriteria = {
      title: this.getStringField('title'),
      state: this.getStringField('state') as CourseState,
    };

    for (const key of Object.keys(data)) {
      if ((data as any)[key] === undefined) {
        delete (data as any)[key];
      }
    }
    return data;
  }
}
