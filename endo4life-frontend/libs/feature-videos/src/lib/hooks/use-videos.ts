import { IEntityData, IFilter } from '@endo4life/types';
import { useQuery } from 'react-query';
import { VideoApiImpl } from '../api';
import { IVideoEntity } from '../types';
import { DEFAULT_PAGINATION, REACT_QUERY_KEYS } from '../constants';

export function useVideos(filter: IFilter): IEntityData<IVideoEntity> {
  const { data, error, isFetching } = useQuery(
    [REACT_QUERY_KEYS.VIDEOS, filter],
    async () => {
      return new VideoApiImpl().getVideos(filter);
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
