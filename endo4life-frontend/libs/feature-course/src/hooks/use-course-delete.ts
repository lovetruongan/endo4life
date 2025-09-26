import { useMutation, useQueryClient } from 'react-query';
import { REACT_QUERY_KEYS } from '../constants';
import { CourseApiImpl } from '../api';

export function useCourseDelete() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const api = new CourseApiImpl();
      return api.deleteCourse(id);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.DELETE_COURSE]);
      console.log('data', data);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
