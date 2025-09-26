import { useMutation, useQueryClient } from 'react-query';
import { CourseApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useDeleteCourses() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (imageIds: string[]) => {
      const api = new CourseApiImpl();
      return await api.deleteCourses(imageIds);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([REACT_QUERY_KEYS.COURSES]);
      },
      onError: (error) => {
        console.error('Error deleting courses:', error);
      },
    }
  );

  return { mutation };
}
