import { CommentResponseDto } from "@endo4life/data-access";
import { BaseEntity } from "@endo4life/types";

export interface ICommentEntity extends BaseEntity<CommentResponseDto> {
  id: string;
  content?: string;
  attachments?: string[];
  comment?: ICommentEntity;
}