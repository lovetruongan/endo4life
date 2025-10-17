import { CourseApiImpl } from '@endo4life/feature-course';
import {
  DEFAULT_PAGINATION,
  IEntityData,
  IFilter,
} from '@endo4life/types';
import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ResourceApiImpl } from '../api';
import {
  ICourseEntity,
  IResourceEntity,
  ResourceFilter,
  ResourceTypeEnum,
} from '../types';

const QUERY_KEY_RESOURCE = 'STUDENT_WEB_RESOURCES';
const QUERY_KEY_COURSE = 'STUDENT_WEB_COURSES';

export function useResources(
  filter: IFilter,
): IEntityData<IResourceEntity | ICourseEntity> {
  const resourceType = useMemo<string>(() => {
    return new ResourceFilter(filter).getType() || ResourceTypeEnum.IMAGE;
  }, [filter]);

  const queryKey =
    resourceType === ResourceTypeEnum.COURSE
      ? [QUERY_KEY_COURSE, filter]
      : [QUERY_KEY_RESOURCE, filter];
  const queryFn =
    resourceType === ResourceTypeEnum.COURSE
      ? async () => new CourseApiImpl().getCourses(filter)
      : async () => new ResourceApiImpl().getResources(filter);

  const { data, error, isFetching } = useQuery(queryKey, queryFn, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    keepPreviousData: true,
  });

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
