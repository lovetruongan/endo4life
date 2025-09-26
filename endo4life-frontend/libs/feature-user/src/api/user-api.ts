import { BaseApi, UserV1Api } from '@endo4life/data-access';
import {
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import {
  IUserCreateFormData,
  IUserEntity,
  IUserInviteFormData,
  IUserUpdateAccountFormData,
  UserFilter,
  UserMapper,
} from '../types';
import { EnvConfig } from '@endo4life/feature-config';
import { DEFAULT_PAGINATION } from '../constants';

export interface IUserApi {
  getUsers(filter: IFilter): Promise<IPaginatedResponse<IUserEntity>>;
  getUserById(userId: string): Promise<IResponse<IUserEntity>>;
  getUserByEmail(email: string): Promise<IResponse<IUserEntity>>;
  updateUser(data: IUserUpdateAccountFormData): Promise<void>;
  inviteUser(data: IUserInviteFormData): Promise<IResponse<IUserEntity>>;
  createUser(data: IUserCreateFormData): Promise<IUserEntity>;
  deleteUser(
    userId: string,
    password: string
  ): Promise<IResponse<IUserEntity>>;
}

export class UserApiImpl extends BaseApi implements IUserApi {
  constructor() {
    super(EnvConfig.ElearningServiceUrl);
  }

  async getUsers(filter: IFilter): Promise<IPaginatedResponse<IUserEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    const userFilter = new UserFilter(filter);
    const criteria = userFilter.toCriteria();
    const pageable = userFilter.toPageable();
    const response = await api.getUsers({ criteria, pageable });
    return {
      data: response.data.data?.map(UserMapper.getInstance().fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async createUser(data: IUserCreateFormData): Promise<IUserEntity> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    const response = await api.createUser(data);
    return UserMapper.getInstance().fromDto(response.data);
  }

  async updateUser(data: IUserUpdateAccountFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    const payload = UserMapper.getInstance().toUpdateRequest(data);
    await api.updateUser(payload);
    return;
  }

  async inviteUser(data: IUserInviteFormData): Promise<IResponse<IUserEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    const inviteUserRequestDto = UserMapper.getInstance().toInviteRequestDto(data);
    const response = await api.inviteUser({ inviteUserRequestDto });
    return { data: UserMapper.getInstance().fromDto(response.data) };
  }

  async deleteUser(
    userId: string,
    password: string
  ): Promise<IResponse<IUserEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    await api.deleteUser({ id: userId, password: password });
    return { data: undefined };
  }

  async getUserById(userId: string): Promise<IResponse<IUserEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    const response = await api.getUserById({ id: userId });
    return { data: UserMapper.getInstance().fromDto(response.data) };
  }

  async getUserByEmail(email: string): Promise<IResponse<IUserEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    const response = await api.getUserByEmail({ email });
    return { data: UserMapper.getInstance().fromDto(response.data) };
  }

  async deleteUsers(ids: string[], password: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new UserV1Api(config);
    await api.deleteUsers({ userIds: ids, password: password });
    return;
  }
}
