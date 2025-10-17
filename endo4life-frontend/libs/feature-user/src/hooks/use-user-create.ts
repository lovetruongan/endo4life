import { useMutation, useQueryClient } from 'react-query';
import { UserApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { IUserCreateFormData } from '../types';

export function useUserCreate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: IUserCreateFormData) => {
      const api = new UserApiImpl();
      return api.createUser(data);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.CREATE_USER]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
