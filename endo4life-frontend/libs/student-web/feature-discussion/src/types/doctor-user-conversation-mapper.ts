import { 
  DoctorUserConversationResponseDto, 
  DoctorUserConversationsV1ApiCreateConversationDoctorAndUserRequest,
} from "@endo4life/data-access";
import { IDoctorUserConversationEntity } from "./doctor-user-conversation-entity";
import { IDoctorUserConversationCreateFormData } from "./doctor-user-conversation-create-form-data";
import { stringUtils } from "@endo4life/util-common";

export interface IDoctorUserConversationMapper {
  fromDto(dto: DoctorUserConversationResponseDto): IDoctorUserConversationEntity;
  toCreateRequest(formData: IDoctorUserConversationCreateFormData): DoctorUserConversationsV1ApiCreateConversationDoctorAndUserRequest;
}

export class DoctorUserConversationMapper implements IDoctorUserConversationMapper {
  private static _instance: DoctorUserConversationMapper | null = null;
  static getInstance(): DoctorUserConversationMapper {
    if (!this._instance) {
      this._instance = new DoctorUserConversationMapper();
    }
    return this._instance;
  }

  fromDto(dto: DoctorUserConversationResponseDto): IDoctorUserConversationEntity {
    if (!dto.id) throw new Error("Invalid DoctorUserConversation DTO");
    return {
      id: dto.id,
      content: dto.content,
      attachmentUrls: dto.attachmentUrls,
      resourceId: dto.resourceId,
      state: dto.state,
      type: dto.type,
      questionerInfo: dto.questionerInfo,
      assigneeInfo: dto.assigneeInfo,
      parentId: dto.parentId,
      replies: dto.replies ? dto.replies.map(reply => this.fromDto(reply)) : undefined,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  toCreateRequest(formData: IDoctorUserConversationCreateFormData): DoctorUserConversationsV1ApiCreateConversationDoctorAndUserRequest {
    return {
      createDoctorUserConversationDto: {
        state: formData.state as any,
        type: formData.type as any,
        resourceId: formData.resourceId || '',
        assigneeId: formData.assigneeId,
        parentId: formData.parentId,
        content: formData.content,
        attachmentUrls: formData.attachments.map(attachment => stringUtils.defaultString(attachment?.id)),
      }
    }
  }
}

