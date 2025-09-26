import { CommentResponseDto, CommentV1ApiCreateCommentRequest, IdWrapperDto } from "@endo4life/data-access";
import { ICommentEntity } from "./comment-entity";
import { objectUtils, stringUtils } from "@endo4life/util-common";
import { ICommentCreateFormData } from "./comment-create-form-data";

export interface ICommentMapper {
  fromDto(dto: CommentResponseDto): ICommentEntity;
  toCreateCommentRequest(formData: ICommentCreateFormData): CommentV1ApiCreateCommentRequest;
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
      comment: dto.comment ? this.fromDto(objectUtils.defaultObject(dto.comment)) : undefined,
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
}