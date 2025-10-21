import { DoctorUserConversationCriteria } from "@endo4life/data-access";
import { BaseFilter, IFilter } from "@endo4life/types";

export interface IDoctorUserConversationFilter extends IFilter {
  
}

export class DoctorUserConversationFilter extends BaseFilter implements IDoctorUserConversationFilter {
  toCriteria(): DoctorUserConversationCriteria {
    const data: DoctorUserConversationCriteria = {
      resourceId: this.getStringField('resourceId'),
      questionerId: this.getStringField('questionerId'),
      assigneeId: this.getStringField('assigneeId'),
      state: this.getStringField('state') as any,
    };

    return data;
  }
}

