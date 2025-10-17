import { useMutation, useQueryClient } from 'react-query';
import { UserApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useUserDelete() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const api = new UserApiImpl();
      return api.deleteUser(id, password);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.USERS]);
      console.log('data', data);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
