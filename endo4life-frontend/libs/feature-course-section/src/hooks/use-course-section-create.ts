import { useMutation, useQueryClient } from 'react-query';
import { CourseSectionApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { ICourseSectionFormData } from '../types';

export function useCourseSectionCreate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: ICourseSectionFormData) => {
      const api = new CourseSectionApiImpl();
      return api.createCourseSection(data);
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
