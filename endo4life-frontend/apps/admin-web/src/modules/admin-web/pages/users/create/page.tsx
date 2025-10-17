import {
  IUserCreateFormData,
  useUserCreate,
} from '@endo4life/feature-user';

import { useCallback } from 'react';
import { toast } from 'react-toastify';
import UserCreateForm from './user-create-form';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useTranslation } from 'react-i18next';

export default function UserCreatePage() {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const { mutation: createUserMutation } = useUserCreate();
  const createAccount = useCallback(
    (values: IUserCreateFormData) => {
      if (!values.user) {
        toast.error(t('errors.insufficientInfo'), {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      createUserMutation.mutate(values, {
        onSuccess(data) {
          toast.success(t('createForm.status.success'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.USERS);
          }, 1000);
        },
        onError(error) {
          console.log(error);
          toast.error(t('createForm.status.error'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          console.error('Lỗi khi gọi API:', error);
        },
      });
    },
    [createUserMutation, navigate],
  );

  return (
    <div className="justify-center inline rounded shadow">
      <UserCreateForm
        loading={createUserMutation.isLoading}
        onSubmit={createAccount}
      />
    </div>
  );
}
