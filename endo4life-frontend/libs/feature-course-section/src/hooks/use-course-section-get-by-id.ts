import { useQuery } from 'react-query';
import { CourseSectionApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useCourseSectionGetById(id: string) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEYS.GET_COURSE_SECTION_BY_ID, id],
    async () => {
      const api = new CourseSectionApiImpl();
      return api.getCourseSectionById(id);
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
