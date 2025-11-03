import { useQuery } from 'react-query';
import { StudentCourseApiImpl } from '../api/student-course-api';

const REACT_QUERY_KEY = 'USER_COURSE_DETAIL';

export function useUserCourseDetail(courseId: string, userInfoId: string) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, courseId, userInfoId],
    async () => {
      if (!courseId || !userInfoId) return null;
      const api = new StudentCourseApiImpl();
      return api.getUserCourseById(courseId, userInfoId);
    },
    {
      enabled: !!courseId && !!userInfoId,
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
