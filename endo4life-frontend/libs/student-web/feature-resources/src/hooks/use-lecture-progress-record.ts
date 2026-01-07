import { useMutation } from 'react-query';
import { StudentCourseApiImpl } from '../api/student-course-api';

interface LectureProgressParams {
  progressId: string;
  watchTime: number;
}

export function useLectureProgressRecord() {

  const mutation = useMutation({
    mutationFn: async ({ progressId, watchTime }: LectureProgressParams) => {
      const api = new StudentCourseApiImpl();
      return api.recordLectureProgress(progressId, watchTime);
    },
    // NOTE: Don't invalidate queries here - it causes video to reload during playback
    // The page manually calls refetch() when video ends
    onError: (error) => {
      console.error('Failed to record lecture progress:', error);
    },
  });

  return { mutation };
}
