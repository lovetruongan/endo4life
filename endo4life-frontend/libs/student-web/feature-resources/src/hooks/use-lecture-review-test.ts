import { useQuery } from 'react-query';
import { StudentTestApiImpl } from '../api/student-test-api';

const REACT_QUERY_KEY = 'LECTURE_REVIEW_TEST';

export function useLectureReviewTest(lectureId: string, userInfoId: string, enabled = true) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, lectureId, userInfoId],
    async () => {
      if (!lectureId || !userInfoId) return null;
      const api = new StudentTestApiImpl();
      return api.getLectureReviewTest(lectureId, userInfoId);
    },
    {
      enabled: !!lectureId && !!userInfoId && enabled,
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

