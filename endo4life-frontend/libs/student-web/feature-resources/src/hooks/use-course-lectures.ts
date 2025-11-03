import { useQuery } from 'react-query';
import { StudentCourseApiImpl } from '../api/student-course-api';

const REACT_QUERY_KEY = 'COURSE_LECTURES';

export function useCourseLectures(courseId: string, userInfoId: string, isEnrolled: boolean) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, courseId, userInfoId],
    async () => {
      if (!courseId || !userInfoId) return [];
      const api = new StudentCourseApiImpl();
      return api.getUserCourseLectures(courseId, userInfoId);
    },
    {
      enabled: !!courseId && !!userInfoId && isEnrolled,
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
