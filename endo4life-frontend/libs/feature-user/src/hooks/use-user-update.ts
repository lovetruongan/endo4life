import { useMutation, useQueryClient } from 'react-query';
import { IUserUpdateAccountFormData, UserMapper } from '../types';
import { UserApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { useAuthContext } from '@endo4life/feature-auth';
import { useTranslation } from 'react-i18next';

interface Props {
  updateCurrentUser?: boolean;
}

export function useUserUpdate({ updateCurrentUser }: Props) {
  const { t } = useTranslation('user');

  const { updateUserInfo } = useAuthContext();
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: IUserUpdateAccountFormData) => {
      if (!data.id) {
        throw new Error(t('deleteForm.invalidUserId'));
      }

      const api = new UserApiImpl();
      const userMapper = new UserMapper();
      const userUpdateParams = userMapper.toUpdateRequest(data);
      await api.updateUser(userUpdateParams);

      return;
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
