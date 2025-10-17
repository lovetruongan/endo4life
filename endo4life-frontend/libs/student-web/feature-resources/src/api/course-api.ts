import { BaseApi, CourseV1Api } from '@endo4life/data-access';
import {
  DEFAULT_PAGINATION,
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { ICourseEntity, CourseFilter } from '../types';
import { EnvConfig } from '@endo4life/feature-config';
import { CourseMapper } from '../types/course-mapper';

export interface ICourseApi {
  getCourses(filter: IFilter): Promise<IPaginatedResponse<ICourseEntity>>;
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

    return {
      data: response.data.data?.map((course) =>
        CourseMapper.getInstance().fromDto(course),
      ),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.PAGE_SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  // async getCourseById(courseId: string): Promise<IResponse<ICourseEntity>> {
  //   const config = await this.getApiConfiguration();
  //   const api = new CourseV1Api(config);
  //   const response = await api.getCourseById({ id: courseId });
  //   return {
  //     data: CourseMapper.getInstance().fromDetailDto(response.data),
  //   };
  // }
}
