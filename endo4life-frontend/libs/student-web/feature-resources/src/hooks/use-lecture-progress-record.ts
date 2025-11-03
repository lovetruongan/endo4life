import { useMutation, useQueryClient } from 'react-query';
import { StudentCourseApiImpl } from '../api/student-course-api';

interface LectureProgressParams {
  progressId: string;
  watchTime: number;
}

export function useLectureProgressRecord() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ progressId, watchTime }: LectureProgressParams) => {
      const api = new StudentCourseApiImpl();
      return api.recordLectureProgress(progressId, watchTime);
    },
    onSuccess: () => {
      // Invalidate queries to refetch progress
      client.invalidateQueries(['COURSE_LECTURES']);
      client.invalidateQueries(['COURSE_PROGRESS']);
    },
    onError: (error) => {
      console.error('Failed to record lecture progress:', error);
    },
  });

  return { mutation };
}
