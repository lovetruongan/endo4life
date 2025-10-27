import { DoctorUserConversationResponseDto } from "@endo4life/data-access";
import { BaseEntity } from "@endo4life/types";

export interface IDoctorUserConversationEntity extends BaseEntity<DoctorUserConversationResponseDto> {
  id: string;
  content?: string;
  attachmentUrls?: string[];
  resourceId?: string;
  state?: string;
  type?: string;
  questionerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
  };
  assigneeInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
  };
  parentId?: string;
  replies?: IDoctorUserConversationEntity[];
}

