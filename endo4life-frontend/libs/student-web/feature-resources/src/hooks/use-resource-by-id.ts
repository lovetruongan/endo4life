import { IResponse } from '@endo4life/types';
import { useQuery } from 'react-query';
import { IResourceEntity } from '../types';
import { ResourceApiImpl } from '../api';

const QUERY_KEY = 'STUDENT_WEB_RESOURCES_DETAIL';

export function useResourceById(resourceId: string): IResponse<IResourceEntity> {
  const { data, error, isFetching } = useQuery<IResponse<IResourceEntity>, Error>(
    [QUERY_KEY, resourceId],
    async () => {
      return new ResourceApiImpl().getResourceById(resourceId);
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
    },
  );

  return {
    loading: isFetching,
    data: data?.data,
    error,
  };
}
