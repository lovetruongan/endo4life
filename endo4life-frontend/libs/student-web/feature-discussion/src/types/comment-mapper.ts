import { CommentResponseDto, CommentV1ApiCreateCommentRequest, CommentV1ApiUpdateCommentRequest, IdWrapperDto } from "@endo4life/data-access";
import { ICommentEntity } from "./comment-entity";
import { stringUtils } from "@endo4life/util-common";
import { ICommentCreateFormData } from "./comment-create-form-data";
import { ICommentUpdateFormData } from "./comment-update-form-data";

export interface ICommentMapper {
  fromDto(dto: CommentResponseDto): ICommentEntity;
  toCreateCommentRequest(formData: ICommentCreateFormData): CommentV1ApiCreateCommentRequest;
  toUpdateCommentRequest(id: string, formData: ICommentUpdateFormData): CommentV1ApiUpdateCommentRequest;
}

export class CommentMapper implements ICommentMapper {
  private static _instance: CommentMapper | null = null;
  static getInstance(): CommentMapper {
    if (!this._instance) {
      this._instance = new CommentMapper();
    }
    return this._instance;
  }

  fromIdWrapperDto(dto: IdWrapperDto) {
    return {
      id: dto.id,
    }
  }

  fromDto(dto: CommentResponseDto): ICommentEntity {
    if (!dto.id) throw new Error("Invalid Resource DTO");
    return {
      id: dto.id,
      content: dto.content,
      attachments: dto.attachments,
      replies: dto.replies ? dto.replies.map(reply => this.fromDto(reply)) : undefined,
      createdAt: dto.createdAt,
      createdBy: dto.createdBy,
    }
  }

  toCreateCommentRequest(formData: ICommentCreateFormData): CommentV1ApiCreateCommentRequest {
    return {
      createCommentRequestDto: {
        attachments: formData.attachments.map(attachment => stringUtils.defaultString(attachment?.id)),
        resourceId: formData.resourceId,
        courseId: formData.courseId,
        parentId: formData.parentId,
        content: formData.content,
        userInfoId: formData.userInfoId,
      }
    }
  }

  toUpdateCommentRequest(id: string, formData: ICommentUpdateFormData): CommentV1ApiUpdateCommentRequest {
    return {
      id,
      updateCommentRequestDto: {
        attachments: formData.attachments?.map(attachment => stringUtils.defaultString(attachment?.id)),
        content: formData.content,
      }
    }
  }
}