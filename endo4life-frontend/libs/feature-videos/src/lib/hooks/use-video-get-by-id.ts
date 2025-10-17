import { useQuery } from 'react-query';
import { VideoApiImpl } from '../api';
import { IVideoEntity } from '../types';
import { IResponse } from '@endo4life/types';
import { REACT_QUERY_KEYS } from '../constants';

export function useVideoGetById(id: string) {
  const { data, error, isLoading, refetch } = useQuery<
    IResponse<IVideoEntity>,
    Error
  >(
    [REACT_QUERY_KEYS.GET_VIDEO_BY_ID, id],
    async () => {
      const api = new VideoApiImpl();
      return api.getVideoById(id);
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
      onSuccess: (response) => {
        console.log(response);
      },
      onError: (error) => {
        console.log('Error fetching video:', error);
      },
    }
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
}
