import { IImageUploadableFormData, IVideoUploadableFormData } from "@endo4life/types";

export interface ICommentCreateFormData {
  attachments: IImageUploadableFormData[] | IVideoUploadableFormData[];
  resourceId: string;
  courseId: string;
  parentId: string;
  content: string;
  userInfoId: string;
}