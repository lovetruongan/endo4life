import { useMutation } from 'react-query';
import { CourseApiImpl } from '../api';
import { ICourseFormData } from '../types';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';

export function useCourseCreate() {
  const mutation = useMutation({
    mutationFn: async (data: ICourseFormData) => {
      const api = new CourseApiImpl();
      return api.createCourse(data);
    },
    onSuccess(courseId) {
      if (courseId) {
        window.location.replace(
          ADMIN_WEB_ROUTES.COURSE_DETAIL.replace(':id', courseId),
        );
      }
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
