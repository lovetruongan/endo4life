import {
  BaseApi,
  CourseSectionV1Api,
  StorageApiImpl,
} from '@endo4life/data-access';
import {
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { EnvConfig } from '@endo4life/feature-config';
import { DEFAULT_PAGINATION } from '../constants';
import {
  ICourseSectionEntity,
  CourseSectionMapper,
  ICourseSectionFormData,
} from '../types';

export interface ICourseSectionApi {
  getCourseSections(
    filter: IFilter,
  ): Promise<IPaginatedResponse<ICourseSectionEntity>>;
  getCourseSectionById(courseSectionId: string): Promise<ICourseSectionEntity>;
  deleteCourseSection(id: string): Promise<void>;
  deleteCourseSections(ids: string[]): Promise<void>;
  createCourseSection(data: ICourseSectionFormData): Promise<void>;
}

export class CourseSectionApiImpl extends BaseApi implements ICourseSectionApi {
  constructor() {
    super(EnvConfig.ElearningServiceUrl);
  }

  async getCourseSections(
    filter: IFilter,
  ): Promise<IPaginatedResponse<ICourseSectionEntity>> {
    const config = await this.getApiConfiguration();
    const api = new CourseSectionV1Api(config);
    const courseSectionMapper = new CourseSectionMapper();
    const payload = courseSectionMapper.toGetManyRequest(filter);
    const response = await api.getCourseSections(payload);
    return {
      data: response.data.data?.map(courseSectionMapper.fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getCourseSectionById(
    courseSectionId: string,
  ): Promise<ICourseSectionEntity> {
    const config = await this.getApiConfiguration();
    const api = new CourseSectionV1Api(config);
    const response = await api.getCourseSectionById({ id: courseSectionId });
    const courseSectionMapper = new CourseSectionMapper();
    return courseSectionMapper.fromDetailDto(response.data);
  }

  async createCourseSection(data: ICourseSectionFormData): Promise<void> {
    const storageApi = new StorageApiImpl(this.getBasePath());
    if (data.thumbnail?.file) {
      data.thumbnail.id = await storageApi.uploadFile(
        data.thumbnail.file,
        'THUMBNAIL',
      );
    }
    if (data.video?.file) {
      data.video.id = await storageApi.uploadFile(data.video.file, 'VIDEO');
    }
    const config = await this.getApiConfiguration();
    const api = new CourseSectionV1Api(config);
    const courseSectionMapper = new CourseSectionMapper();
    const payload = courseSectionMapper.toCreateRequest(data);
    await api.createCourseSection(payload);
    return;
  }

  async deleteCourseSection(id: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseSectionV1Api(config);
    await api.deleteCourseSection({ id });
    return;
  }

  async deleteCourseSections(ids: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseSectionV1Api(config);
    await api.deleteCourseSections({ ids });
    return;
  }
}
