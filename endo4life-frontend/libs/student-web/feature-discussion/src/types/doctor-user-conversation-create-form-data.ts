import { IImageUploadableFormData } from "@endo4life/types";

export interface IDoctorUserConversationCreateFormData {
  attachments: IImageUploadableFormData[];
  state: string;
  type: string;
  resourceId?: string;
  assigneeId?: string;
  parentId?: string;
  content: string;
}

