import { useQuery } from 'react-query';
import axios from 'axios';
import { EnvConfig } from '@endo4life/feature-config';

const REACT_QUERY_KEY = 'COURSE_PROGRESS_STATUS';

export interface CourseProgressStatus {
  id: string;
  userInfoId: string;
  courseId: string;
  isCompletedEntranceTest: boolean;
  isCompletedSurveyCourse: boolean;
  isCompletedTotalCourseSection: boolean;
  isCompletedFinalCourseTest: boolean;
  isCompletedCourse: boolean;
}

export function useCourseProgressStatus(userInfoId: string, courseId: string, enabled = true) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, userInfoId, courseId],
    async () => {
      if (!userInfoId || !courseId) return null;
      
      // Get token from localStorage (set by auth provider)
      const token = localStorage.getItem('endo4life_access_token') || '';
      const response = await axios.get<CourseProgressStatus>(
        `${EnvConfig.Endo4LifeServiceUrl}/api/v1/user/courses/progress/status`,
        {
          params: { userInfoId, courseId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    {
      enabled: !!userInfoId && !!courseId && enabled,
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

