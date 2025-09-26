import { useMutation, useQueryClient } from 'react-query';
import { UserApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useDeleteUsers() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ ids, password }: { ids: string[], password: string }) => {
      const api = new UserApiImpl();
      return await api.deleteUsers(ids, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([REACT_QUERY_KEYS.USERS]);
    },
    onError: (error: Error) => {
      console.error('Error deleting users:', error);
    },
  });

  return { mutation };
}
