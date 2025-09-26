import { useQuery } from 'react-query';
import { ICourseEntity } from '../types/course-entity';
import { CourseApiImpl } from '../api';
import {
  IFilter,
  IEntityData,
  DEFAULT_PAGINATION,
} from '@endo4life/types';

export function useCourses(filter: IFilter): IEntityData<ICourseEntity> {
  const { data, error, isFetching } = useQuery(
    ['STUDENT_WEB_COURSES', filter],
    async () => new CourseApiImpl().getCourses(filter),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
    },
  );

  return {
    loading: isFetching,
    data: data?.data,
    pagination: {
      page: (data?.pagination?.page ?? DEFAULT_PAGINATION.PAGE) + 1,
      size: data?.pagination?.size ?? DEFAULT_PAGINATION.PAGE_SIZE,
      totalCount: data?.pagination?.totalCount ?? 0,
    },
    error,
  };
}
