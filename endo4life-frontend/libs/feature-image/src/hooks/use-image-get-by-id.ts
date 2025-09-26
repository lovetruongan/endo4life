import {  useQuery } from 'react-query';
import { ImageApiImpl } from '../api';
import { IImageEntity } from '../types';
import { IResponse } from '@endo4life/types';
import { REACT_QUERY_KEYS } from '../constants';

export function useImageGetById(id: string) {
  const { data, error, isLoading, refetch } = useQuery<IResponse<IImageEntity>, Error>(
    [REACT_QUERY_KEYS.GET_IMAGE_BY_ID, id],
    async () => {
      const api = new ImageApiImpl();
      return api.getImageById(id);
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
      onSuccess: (response: IResponse<IImageEntity>) => {
        
      },
      onError: (error: Error) => {
        console.log('Error fetching image:', error);
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
