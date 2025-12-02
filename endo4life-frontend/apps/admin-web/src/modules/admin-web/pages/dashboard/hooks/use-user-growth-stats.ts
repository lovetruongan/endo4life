import { useQuery } from 'react-query';
import { statsApi, UserGrowthStat } from '../api';

export function useUserGrowthStats(days: number = 30) {
  const { data, isLoading, error } = useQuery<UserGrowthStat[]>(
    ['user-growth-stats', days],
    () => statsApi.getUserGrowthStats(days),
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

