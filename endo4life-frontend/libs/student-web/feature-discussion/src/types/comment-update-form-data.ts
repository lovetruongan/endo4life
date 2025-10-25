import { IImageUploadableFormData, IVideoUploadableFormData } from "@endo4life/types";

export interface ICommentUpdateFormData {
  attachments?: IImageUploadableFormData[] | IVideoUploadableFormData[];
  content: string;
}

