import { CommentCriteria } from "@endo4life/data-access";
import { BaseFilter, IFilter } from "@endo4life/types";

export interface ICommentFilter extends IFilter {
  
}

export class CommentFilter extends BaseFilter implements ICommentFilter {
  toCriteria(): CommentCriteria {
    const data: CommentCriteria = {
      resourceId: this.getStringField('resourceId'),
      courseId: this.getStringField('courseId'),
    };

    return data;
  }
}