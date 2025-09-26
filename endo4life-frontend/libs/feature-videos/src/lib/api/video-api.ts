import { BaseApi, ResourceV1Api } from '@endo4life/data-access';
import {
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { EnvConfig } from '@endo4life/feature-config';
import { DEFAULT_PAGINATION } from '../constants';
import {
  IVideoCreateFormData,
  IVideoEntity,
  VideoFilter,
  VideoMapper,
  IVideoUpdateFormData,
} from '../types';

export interface IVideoApi {
  getVideos(filter: IFilter): Promise<IPaginatedResponse<IVideoEntity>>;
  updateVideo(data: IVideoUpdateFormData): Promise<void>;
  createVideo(data: IVideoCreateFormData): Promise<void>;
  importFileVideo(data: IVideoCreateFormData): Promise<void>;
  getVideoById(videoId: string): Promise<IResponse<IVideoEntity>>;
}

export class VideoApiImpl extends BaseApi implements IVideoApi {
  constructor() {
    super(EnvConfig.ElearningServiceUrl);
  }

  async getVideos(filter: IFilter): Promise<IPaginatedResponse<IVideoEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const videoFilter = new VideoFilter(filter);
    const criteria = videoFilter.toCriteria();
    const pageable = videoFilter.toPageable();
    const response = await api.getResources({ criteria, pageable });
    const videoMapper = new VideoMapper();
    return {
      data: response.data.data?.map(videoMapper.fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getVideoById(videoId: string): Promise<IResponse<IVideoEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const response = await api.getResourceById({ id: videoId });
    const videoMapper = new VideoMapper();
    return {
      data: videoMapper.fromDetailDto(response.data),
    };
  }

  async createVideo(data: IVideoCreateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const videoMapper = new VideoMapper();
    await api.createResource(videoMapper.toCreateResourceRequest(data));
    return;
  }

  async importFileVideo(data: IVideoCreateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const videoMapper = new VideoMapper();
    await api.createResource(videoMapper.toUploadResourceRequest(data));
    return;
  }

  async updateVideo(data: IVideoUpdateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const videoMapper = new VideoMapper();
    await api.updateResource(videoMapper.toUpdateResourceRequest(data));
    return;
  }

  async deleteVideo(id: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResource({ id });
    return;
  }

  async deleteVideos(ids: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResources({ id: ids });
    return;
  }
}
