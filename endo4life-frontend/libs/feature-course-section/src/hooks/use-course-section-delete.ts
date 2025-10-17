import { useMutation, useQueryClient } from 'react-query';
import { CourseSectionApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useCourseSectionDelete() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const api = new CourseSectionApiImpl();
      return api.deleteCourseSection(id);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.DELETE_COURSE_SECTION]);
      console.log('data', data);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
