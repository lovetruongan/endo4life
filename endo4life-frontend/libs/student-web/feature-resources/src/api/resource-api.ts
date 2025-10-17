import {
  BaseApi,
  UserResourceHistoryV1Api,
  UserResourceType,
  UserResourceV1Api,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import {
  DEFAULT_PAGINATION,
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { IResourceEntity, ResourceFilter } from '../types';
import { ResourceMapper } from '../types/resource-mapper';

export interface IResourceApi {
  getResources(filter: IFilter): Promise<IPaginatedResponse<IResourceEntity>>;
  getResourceById(resourceId: string): Promise<IResponse<IResourceEntity>>;
}

export class ResourceApiImpl extends BaseApi implements IResourceApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  async getResources(
    filter: IFilter,
  ): Promise<IPaginatedResponse<IResourceEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserResourceV1Api(config);
    const resourceFilter = new ResourceFilter(filter);
    const criteria = resourceFilter.toCriteria();
    const pageable = resourceFilter.toPageable();
    const response = await api.getUserResources({ criteria, pageable });
    return {
      data: response.data.data?.map((resource) =>
        ResourceMapper.getInstance().fromDto(resource),
      ),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.PAGE_SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getResourceById(
    resourceId: string,
  ): Promise<IResponse<IResourceEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserResourceV1Api(config);
    const response = await api.getUserResourceById({ id: resourceId });
    return {
      data: ResourceMapper.getInstance().fromDetailDto(response.data),
    };
  }

  async getResourcesAccessedByUserInfoIdAndType(
    userId: string,
    resourceType: UserResourceType,
  ): Promise<IPaginatedResponse<IResourceEntity>> {
    const config = await this.getApiConfiguration();
    const api = new UserResourceHistoryV1Api(config);
    const response = await api.getResourcesAccessedByUserInfoIdAndType({
      criteria: { userInfoId: userId, type: resourceType },
    });
    return {
      data: response.data.data?.map((resource) =>
        ResourceMapper.getInstance().fromDto(resource),
      ),
    };
  }
}
