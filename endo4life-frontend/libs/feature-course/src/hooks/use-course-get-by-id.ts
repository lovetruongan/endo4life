import { useQuery } from 'react-query';
import { CourseApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { isLocalUuid } from '@endo4life/util-common';

export function useCourseGetById(id: string) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEYS.GET_COURSE_BY_ID, id],
    async () => {
      if (isLocalUuid(id)) return { id, title: '' };
      const api = new CourseApiImpl();
      return api.getCourseById(id);
    },
    {
      onSuccess: (response) => {
        console.log(response);
      },
      onError: (error) => {
        console.log('Error fetching course:', error);
      },
    },
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
}
