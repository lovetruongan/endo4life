import {
  CreateUserRequestDto,
  InviteUserRequestDto,
  UserInfoRole,
  UserInfoState,
  UserResponseDto,
  UserV1ApiUpdateUserRequest,
} from '@endo4life/data-access';
import { IUserEntity } from './user-entity';
import {
  IUserFormData,
  IUserInviteFormData,
  IUserUpdateAccountFormData,
} from './user-form-data';
import { IResponse } from '@endo4life/types';

export interface IUserMapper {
  fromDto(dto: UserResponseDto): IUserEntity;
  toFormData(entity: IUserEntity): IUserFormData;
  toUpdateRequest(data: IUserFormData): UserV1ApiUpdateUserRequest;
  toCreateRequestDto(data: IUserFormData): CreateUserRequestDto;
  toInviteRequestDto(data: IUserInviteFormData): InviteUserRequestDto;
}

export class UserMapper implements IUserMapper {
  private static _instance: UserMapper | null = null;
  static getInstance(): UserMapper {
    if (!this._instance) {
      this._instance = new UserMapper();
    }
    return this._instance;
  }

  toInviteRequestDto(data: IUserInviteFormData): InviteUserRequestDto {
    return {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      state: data.state as UserInfoState,
      role: data.role as UserInfoRole,
    };
  }
  fromDto(dto: UserResponseDto): IUserEntity {
    if (!dto.id) throw new Error('Invalid User DTO');
    return {
      id: dto.id,
      lastName: dto.lastName,
      firstName: dto.firstName,
      role: dto.role,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      state: dto.state,
      isUpdatedProfile: dto.isUpdatedProfile,
      avatarLink: dto.avatarLink,
      createdAt: dto.createdAt,
      createdBy: dto.createdBy,
      metadata: dto,
    };
  }
  toFormData(entity: IUserEntity): IUserFormData {
    return {
      id: entity.id,
      role: entity.role,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      state: entity.state,
      isUpdatedProfile: entity.isUpdatedProfile,
      avatarLink: entity.avatarLink,
      metadata: entity,
    };
  }
  toUserDetailForm(
    response: IResponse<IUserEntity> | undefined
  ): IUserUpdateAccountFormData {
    const res = response?.data;
    return {
      id: res?.id,
      email: res?.email,
      user: {
        lastName: res?.metadata?.lastName,
        firstName: res?.metadata?.firstName,
        phoneNumber: res?.phoneNumber,
        isUpdatedProfile: res?.isUpdatedProfile,
        role: res?.role,
        state: res?.state,
      },
      avatarLink: res?.avatarLink,
    };
  }
  toUpdateRequest(
    data: IUserUpdateAccountFormData
  ): UserV1ApiUpdateUserRequest {
    if (!data.id) throw new Error('Invalid id');
    return {
      id: data.id,
      user: data.user,
      avatar: data.avatar,
    };
  }
  toCreateRequestDto(data: IUserFormData): CreateUserRequestDto {
    throw new Error('Method not implemented.');
  }
}
