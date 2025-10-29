import { useMutation, useQueryClient } from 'react-query';
import { REACT_QUERY_KEYS } from '../constants';
import { ICourseSectionFormData } from '../types';
import { CourseSectionApiImpl } from '../api';

export function useCourseSectionUpdate() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ICourseSectionFormData) => {
      if (!data.id) {
        throw new Error('Id của bài giảng không tồn tại.');
      }
      const api = new CourseSectionApiImpl();
      const response = await api.updateCourseSection(data);
      return response;
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.COURSE_SECTIONS]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}

