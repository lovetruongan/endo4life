import { BaseApi } from '@endo4life/data-access';
import {
  UserResourceHistoryV1Api,
  UserResourcesAccessedResponsePaginatedDto,
  UserResourceType,
  UserResourceHistoryCriteria,
  Pageable,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';

export interface IWatchHistoryApi {
  getResourcesAccessed(
    userInfoId: string,
    type: UserResourceType,
    pageable?: Pageable
  ): Promise<UserResourcesAccessedResponsePaginatedDto>;
  createUserResourceAccess(
    userInfoId: string,
    resourceId: string,
    type: UserResourceType
  ): Promise<string>;
}

export class WatchHistoryApiImpl extends BaseApi implements IWatchHistoryApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  async getResourcesAccessed(
    userInfoId: string,
    type: UserResourceType,
    pageable?: Pageable
  ): Promise<UserResourcesAccessedResponsePaginatedDto> {
    const config = await this.getApiConfiguration();
    const api = new UserResourceHistoryV1Api(config);
    
    const criteria: UserResourceHistoryCriteria = {
      userInfoId,
      type,
    };

    const response = await api.getResourcesAccessedByUserInfoIdAndType({
      criteria,
      pageable,
    });
    
    return response.data;
  }

  async createUserResourceAccess(
    userInfoId: string,
    resourceId: string,
    type: UserResourceType
  ): Promise<string> {
    const config = await this.getApiConfiguration();
    const api = new UserResourceHistoryV1Api(config);
    
    const response = await api.createUserResource({
      userInfoId,
      resourceId,
      type,
    });
    
    return response.data.id || '';
  }
}
