import { useMutation, useQueryClient } from 'react-query';
import { UserApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { IUserInviteFormData } from '../types';

export function useUserInvite() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: IUserInviteFormData) => {
      const api = new UserApiImpl();
      return api.inviteUser(data);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.USERS]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
