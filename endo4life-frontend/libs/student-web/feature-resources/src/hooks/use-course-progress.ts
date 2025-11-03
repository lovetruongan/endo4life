import { useQuery } from 'react-query';
import { StudentCourseApiImpl } from '../api/student-course-api';

const REACT_QUERY_KEY = 'COURSE_PROGRESS';

export function useCourseProgress(userInfoId: string) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, userInfoId],
    async () => {
      if (!userInfoId) return [];
      const api = new StudentCourseApiImpl();
      return api.getProgressCoursesUser(userInfoId);
    },
    {
      enabled: !!userInfoId,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  return {
    data: data || [],
    loading: isLoading,
    error,
    refetch,
  };
}
