import { useQuery } from 'react-query';
import { WatchHistoryApiImpl } from '../api/watch-history-api';
import { UserResourceType, Pageable } from '@endo4life/data-access';
import { DEFAULT_PAGINATION } from '@endo4life/types';

const REACT_QUERY_KEY = 'WATCH_HISTORY';

interface UseWatchHistoryParams {
  userInfoId: string;
  type: UserResourceType;
  page?: number;
  size?: number;
}

export function useWatchHistory({
  userInfoId,
  type,
  page = 0,
  size = 12,
}: UseWatchHistoryParams) {
  const pageable: Pageable = {
    page,
    size,
  };

  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, userInfoId, type, page, size],
    async () => {
      if (!userInfoId) return { data: [], total: 0 };
      const api = new WatchHistoryApiImpl();
      return api.getResourcesAccessed(userInfoId, type, pageable);
    },
    {
      enabled: !!userInfoId,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    data: data?.data || [],
    loading: isLoading,
    error,
    refetch,
    pagination: {
      page: (page ?? DEFAULT_PAGINATION.PAGE) + 1,
      size: size ?? DEFAULT_PAGINATION.PAGE_SIZE,
      totalCount: data?.total ?? 0,
    },
  };
}
