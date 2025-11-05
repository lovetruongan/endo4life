import { useQuery } from 'react-query';
import { StudentTestApiImpl } from '../api/student-test-api';

const REACT_QUERY_KEY = 'FINAL_EXAM';

export function useFinalExam(courseId: string, userInfoId: string, enabled = true) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, courseId, userInfoId],
    async () => {
      if (!courseId || !userInfoId) return null;
      const api = new StudentTestApiImpl();
      return api.getFinalExam(courseId, userInfoId);
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

