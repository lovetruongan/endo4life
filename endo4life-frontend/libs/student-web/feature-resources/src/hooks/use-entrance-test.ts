import { useQuery } from 'react-query';
import { StudentTestApiImpl } from '../api/student-test-api';

const REACT_QUERY_KEY = 'ENTRANCE_TEST';

export function useEntranceTest(courseId: string, userInfoId: string, enabled = true) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, courseId, userInfoId],
    async () => {
      if (!courseId || !userInfoId) return null;
      const api = new StudentTestApiImpl();
      return api.getEntranceTest(courseId, userInfoId);
    },
    {
      enabled: !!courseId && !!userInfoId && enabled,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
}

