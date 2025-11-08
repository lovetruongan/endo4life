import {
  UserInfoRole,
  UserInfoState,
} from '@endo4life/data-access';
import { IUserEntity, IUserUpdateEntity } from './user-entity';

export interface IUserFormData {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  isUpdatedProfile?: boolean;
  avatarLink?: string;
  metadata?: IUserEntity;
}

export interface IUserInviteFormData {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserInfoRole;
  state?: UserInfoState;
}

export interface IUserCreateFormData {
  user: {
    username?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    role: UserInfoRole;
    password: string;
    confirmPassword: string;
    state?: UserInfoState;
  };
  avatar?: File;
  certificate?: File[];
}

export interface IUserUpdateAccountFormData {
  id?: string;
  email?: string;
  user?: {
    phoneNumber?: string;
    role?: UserInfoRole;
    state?: UserInfoState;
    isUpdatedProfile?: boolean;
    lastName?: string;
    firstName?: string;
  };
  avatar?: File;
  avatarLink?: string;
}

export interface IUpdateUserParameters {
  id: string;
  user?: IUserUpdateEntity;
  avatar?: File;
}
