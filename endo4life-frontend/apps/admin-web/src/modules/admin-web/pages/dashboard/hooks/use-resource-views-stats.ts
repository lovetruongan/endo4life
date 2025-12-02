import { useQuery } from 'react-query';
import { statsApi, ResourceViewStat } from '../api';

export function useResourceViewsStats(limit: number = 10, type?: string) {
  const { data, isLoading, error } = useQuery<ResourceViewStat[]>(
    ['resource-views-stats', limit, type],
    () => statsApi.getResourceViewsStats(limit, type),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  return {
    data: data ?? [],
    loading: isLoading,
    error,
  };
}

