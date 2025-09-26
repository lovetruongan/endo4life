import {
  DEFAULT_PAGINATION,
  IEntityData,
  IFilter,
} from '@endo4life/types';
import { useQuery } from 'react-query';
import { CourseApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { ICourseEntity } from '../types/course-entity';

export function useCourses(filter: IFilter): IEntityData<ICourseEntity> {
  const { data, error, isFetching } = useQuery(
    [REACT_QUERY_KEYS.COURSES, filter],
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
