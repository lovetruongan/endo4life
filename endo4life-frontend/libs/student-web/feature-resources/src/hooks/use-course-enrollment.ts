import { useMutation, useQueryClient } from 'react-query';
import { StudentCourseApiImpl } from '../api/student-course-api';

interface EnrollmentParams {
  courseId: string;
  userInfoId: string;
}

export function useCourseEnrollment() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ courseId, userInfoId }: EnrollmentParams) => {
      const api = new StudentCourseApiImpl();
      return api.enrollUserInCourse(courseId, userInfoId);
    },
    onSuccess: (_, variables) => {
      // Invalidate course detail query to refetch with new enrollment status
      client.invalidateQueries(['USER_COURSE_DETAIL', variables.courseId]);
      client.invalidateQueries(['COURSE_PROGRESS']);
    },
    onError: (error) => {
      console.error('Enrollment error:', error);
    },
  });

  return { mutation };
}
