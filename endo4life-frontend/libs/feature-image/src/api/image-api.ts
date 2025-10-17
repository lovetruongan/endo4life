import { BaseApi, ResourceV1Api } from '@endo4life/data-access';
import {
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { EnvConfig } from '@endo4life/feature-config';
import { DEFAULT_PAGINATION } from '../constants';
import {
  IImageCreateFormData,
  IImageEntity,
  ImageFilter,
  ImageMapper,
  IImageUpdateFormData,
} from '../types';

export interface IImageApi {
  getImages(filter: IFilter): Promise<IPaginatedResponse<IImageEntity>>;
  updateImage(data: IImageUpdateFormData): Promise<void>;
  createImage(data: IImageCreateFormData): Promise<void>;
  deleteImage(id: string): Promise<void>;
  deleteImages(ids: string[]): Promise<void>;
  importFileImage(data: IImageCreateFormData): Promise<void>;
  getImageById(imageId: string): Promise<IResponse<IImageEntity>>;
}

export class ImageApiImpl extends BaseApi implements IImageApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  async getImages(filter: IFilter): Promise<IPaginatedResponse<IImageEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const imageFilter = new ImageFilter(filter);
    const criteria = imageFilter.toCriteria();
    const pageable = imageFilter.toPageable();
    const response = await api.getResources({ criteria, pageable });
    return {
      data: response.data.data?.map(ImageMapper.getInstance().fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getImageById(imageId: string): Promise<IResponse<IImageEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const response = await api.getResourceById({ id: imageId });
    return {
      data: ImageMapper.getInstance().fromDetailDto(response.data),
    };
  }

  async createImage(data: IImageCreateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.createResource(ImageMapper.getInstance().toCreateResourceRequest(data));
    return;
  }

  async importFileImage(data: IImageCreateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.createResource(ImageMapper.getInstance().toUploadResourceRequest(data));
    return;
  }

  async updateImage(data: IImageUpdateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.updateResource(ImageMapper.getInstance().toUpdateResourceRequest(data));
    return;
  }

  async deleteImage(id: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResource({ id });
    return;
  }

  async deleteImages(ids: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResources({ id: ids });
    return;
  }
}
