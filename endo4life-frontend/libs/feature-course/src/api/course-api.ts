import {
  BaseApi,
  CourseV1Api,
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
  ICourseEntity,
  CourseFilter,
  CourseMapper,
  ICourseInfoFormData,
  ICourseFormData,
} from '../types';

export interface ICourseApi {
  getCourses(filter: IFilter): Promise<IPaginatedResponse<ICourseEntity>>;
  updateCourse(data: ICourseInfoFormData): Promise<void>;
  updateCourseV2(data: ICourseFormData): Promise<void>;
  createCourse(data: ICourseFormData): Promise<string | undefined>;
  getCourseById(imageId: string): Promise<ICourseEntity>;
  deleteCourse(id: string): Promise<void>;
  deleteCourses(ids: string[]): Promise<void>;
}

export class CourseApiImpl extends BaseApi implements ICourseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }
  async getCourses(
    filter: IFilter,
  ): Promise<IPaginatedResponse<ICourseEntity>> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseFilter = new CourseFilter(filter);
    const criteria = courseFilter.toCriteria();
    const pageable = courseFilter.toPageable();
    const response = await api.getCourses({ criteria, pageable });
    const courseMapper = new CourseMapper();
    return {
      data: response.data.data?.map(courseMapper.fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getCourseById(courseId: string): Promise<ICourseEntity> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseMapper = new CourseMapper();
    return api
      .getCourseById({ id: courseId })
      .then((res) => courseMapper.fromDto(res.data));
  }

  async createCourse(data: ICourseFormData): Promise<string | undefined> {
    if (data.thumbnail?.file) {
      const storageApi = new StorageApiImpl(this.getBasePath());
      data.thumbnail.id = await storageApi.uploadFile(
        data.thumbnail.file,
        'THUMBNAIL',
      );
    }
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseMapper = new CourseMapper();
    return api
      .createCourse(courseMapper.toCreateRequest(data))
      .then((res) => res.data.id);
  }

  async updateCourse(data: ICourseInfoFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseMapper = new CourseMapper();
    await api.updateCourse(courseMapper.toUpdateCourseRequest(data));
    return;
  }

  async updateCourseV2(data: ICourseFormData): Promise<void> {
    if (data.thumbnail?.file) {
      const storageApi = new StorageApiImpl(this.getBasePath());
      data.thumbnail.id = await storageApi.uploadFile(
        data.thumbnail.file,
        'THUMBNAIL',
      );
    }
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseMapper = new CourseMapper();
    await api.updateCourse(courseMapper.toUpdateRequestV2(data));
    return;
  }

  async deleteCourse(id: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    await api.deleteCourse({ id });
    return;
  }

  async deleteCourses(ids: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    for (const id of ids) {
      await api.deleteCourse({ id });
    }
    return;
  }
}
