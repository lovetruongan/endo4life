import { useMutation, useQueryClient } from 'react-query';
import { CourseSectionApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useDeleteCourseSections() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (imageIds: string[]) => {
      const api = new CourseSectionApiImpl();
      return await api.deleteCourseSections(imageIds);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([REACT_QUERY_KEYS.COURSE_SECTIONS]);
      },
      onError: (error) => {
        console.error('Error deleting courses:', error);
      },
    }
  );

  return { mutation };
}
