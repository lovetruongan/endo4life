import { useCallback } from 'react';
import { useParams } from 'react-router';
import UserDetailForm from './user-detail-form';
import { useNavigate } from 'react-router-dom';
import {
  IUserUpdateAccountFormData,
  UserMapper,
  useUserGetById,
  useUserUpdate,
} from '@endo4life/feature-user';
import { toast } from 'react-toastify';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useTranslation } from 'react-i18next';

export default function UserDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const userMapper = new UserMapper();
  const { data, loading } = useUserGetById(id);
  const { mutation: updateUserMutation } = useUserUpdate({});

  const updateAccount = useCallback(
    (values: IUserUpdateAccountFormData) => {
      if (!values.id || !values.user) {
        toast.error(t('errors.insufficientInfo'), {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      updateUserMutation.mutate(values, {
        onSuccess(data) {
          toast.success(t('updateForm.status.success'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.USERS);
          }, 1000);
        },
        onError(error) {
          toast.error(t('updateForm.status.error'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          console.error('Lỗi khi gọi API:', error);
        },
      });
    },
    [updateUserMutation, navigate],
  );

  return (
    <div className="justify-center inline">
      {!loading && data && (
        <UserDetailForm
          loading={updateUserMutation.isLoading}
          data={userMapper.toUserDetailForm(data)}
          onSubmit={updateAccount}
        />
      )}
    </div>
  );
}
