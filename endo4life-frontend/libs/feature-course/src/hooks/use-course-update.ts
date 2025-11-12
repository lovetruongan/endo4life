import { useMutation, useQueryClient } from 'react-query';
import { REACT_QUERY_KEYS } from '../constants';
import { useTranslation } from 'react-i18next';
import { ICourseFormData, ICourseInfoFormData } from '../types';
import { CourseApiImpl } from '../api';

export function useCourseUpdate() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICourseFormData) => {
      if (!data.id) {
        throw new Error('Id của khoá học không tồn tại.');
      }
      const api = new CourseApiImpl();
      const response = await api.updateCourseV2(data);
      return response;
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.GET_COURSE_BY_ID]);
      client.invalidateQueries([REACT_QUERY_KEYS.COURSES]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
