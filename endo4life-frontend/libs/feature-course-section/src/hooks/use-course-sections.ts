import { IEntityData, IFilter } from '@endo4life/types';
import { useQuery } from 'react-query';
import { CourseSectionApiImpl } from '../api';
import { ICourseSectionEntity } from '../types';
import { DEFAULT_PAGINATION, REACT_QUERY_KEYS } from '../constants';

export function useCourseSections(
  filter: IFilter
): IEntityData<ICourseSectionEntity> {
  const { data, error, isFetching } = useQuery(
    [REACT_QUERY_KEYS.COURSE_SECTIONS, filter],
    async () => {
      return new CourseSectionApiImpl().getCourseSections(filter);
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
    }
  );

  return {
    loading: isFetching,
    data: data?.data,
    pagination: {
      page: (data?.pagination?.page ?? DEFAULT_PAGINATION.PAGE) + 1,
      size: data?.pagination?.size ?? DEFAULT_PAGINATION.SIZE,
      totalCount: data?.pagination?.totalCount ?? 0,
    },
    error,
  };
}
