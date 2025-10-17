import {
  CourseApiImpl,
  ICourseEntity,
  REACT_QUERY_KEYS,
} from '@endo4life/feature-course';
import { IEntityData, SortOrderEnum } from '@endo4life/types';
import { useDebounce } from 'ahooks';
import { useQuery } from 'react-query';
import { ResourceApiImpl } from '../api';
import { CourseFilter, IResourceEntity, ResourceFilter } from '../types';

const QUERY_KEY_RESOURCE = 'STUDENT_WEB_RESOURCES';
const DEFAULT_RESOURCES_SEARCH_FILTER = {
  page: 0,
  size: 5,
  sort: {
    field: 'createdAt',
    order: SortOrderEnum.DESC,
  },
};

export enum ResourceType {
  Image = 'IMAGE',
  Video = 'VIDEO',
  Course = 'COURSE',
}

export function useResourcesSearch(
  resourceType: ResourceType,
  value: string,
): IEntityData<IResourceEntity | ICourseEntity> {
  const debounceSearch = useDebounce(value, { wait: 300 });
  const filter =
    resourceType === ResourceType.Course
      ? new CourseFilter(DEFAULT_RESOURCES_SEARCH_FILTER)
      : new ResourceFilter(DEFAULT_RESOURCES_SEARCH_FILTER);

  if (resourceType === ResourceType.Course) {
    filter.setQuery('title', debounceSearch);
  } else {
    filter.setSearch(debounceSearch);
    filter.setQuery('resourceType', resourceType);
  }

  const queryKey =
    resourceType === ResourceType.Course
      ? [REACT_QUERY_KEYS.COURSES, filter]
      : [QUERY_KEY_RESOURCE, resourceType, debounceSearch];
  const queryFn =
    resourceType === ResourceType.Course
      ? async () => new CourseApiImpl().getCourses(filter)
      : async () => new ResourceApiImpl().getResources(filter);

  const { data, error, isFetching } = useQuery(queryKey, queryFn, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  return {
    loading: isFetching,
    data: data?.data,
    pagination: {
      page:
        (data?.pagination?.page ?? DEFAULT_RESOURCES_SEARCH_FILTER.page) + 1,
      size: data?.pagination?.size ?? DEFAULT_RESOURCES_SEARCH_FILTER.size,
      totalCount: data?.pagination?.totalCount ?? 0,
    },
    error,
  };
}
