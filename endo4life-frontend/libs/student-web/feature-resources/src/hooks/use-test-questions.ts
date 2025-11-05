import { useQuery } from 'react-query';
import { StudentTestApiImpl } from '../api/student-test-api';

const REACT_QUERY_KEY = 'TEST_QUESTIONS';

export function useTestQuestions(testId: string, userInfoId: string, enabled = true) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, testId, userInfoId],
    async () => {
      if (!testId || !userInfoId) return null;
      const api = new StudentTestApiImpl();
      return api.getTestQuestions(testId, userInfoId);
    },
    {
      enabled: !!testId && !!userInfoId && enabled,
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

