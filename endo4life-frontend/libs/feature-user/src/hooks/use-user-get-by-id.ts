import { useQuery } from 'react-query';
import { UserApiImpl } from '../api';
import { IUserEntity } from '../types';
import { IResponse } from '@endo4life/types';
import { REACT_QUERY_KEYS } from '../constants';

export function useUserGetById(id: string) {
  const { data, error, isLoading } = useQuery<IResponse<IUserEntity>, Error>(
    [REACT_QUERY_KEYS.GET_USER_BY_ID, id],
    async () => {
      const api = new UserApiImpl();
      return api.getUserById(id);
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
      onSuccess: (response) => {
        console.log(response);
      },
      onError: (error) => {
        console.log('Error fetching user:', error);
      },
    }
  );

  return {
    data,
    loading: isLoading,
    error,
  };
}
