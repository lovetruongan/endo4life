import {
  UserInfoRole,
  UserInfoState,
  UserResponseDto,
} from '@endo4life/data-access';
import { BaseEntity } from '@endo4life/types';
export interface IUserEntity extends BaseEntity<UserResponseDto> {
  id: string;
  lastName?: string;
  firstName?: string;
  role?: UserInfoRole;
  user?: IUserUpdateEntity;
  email?: string;
  phoneNumber?: string;
  state?: UserInfoState;
  certificate?: File[];
  isUpdatedProfile?: boolean;
  avatarLink?: string;
}

export interface IUserUpdateEntity {
  phoneNumber?: string;
  role?: UserInfoRole;
  state?: UserInfoState;
  isUpdatedProfile?: boolean;
  firstName?: string;
  lastName?: string;
}

export interface IUserDeleteEntity {
  id?: string;
  email?: string;
}