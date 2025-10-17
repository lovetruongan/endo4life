import { Modal } from '@mui/material';
import { IUserInviteFormData } from '../../types';
import UserInviteForm from './user-invite-form';
import { useTranslation } from 'react-i18next';
import { useUserInvite } from '../../hooks';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

interface Props {
  onClose(): void;
}
export function UserInviteDialog({ onClose }: Props) {
  const { t } = useTranslation('user');
  const { mutation } = useUserInvite();

  const inviteUser = useCallback(
    async (data: IUserInviteFormData) => {
      try {
        mutation.mutate(data, {
          onSuccess(data, variables, context) {
            toast.success(t('inviteForm.successfullyInviteUser'), {
              position: 'top-right',
              autoClose: 2000,
              hideProgressBar: true,
            });
            onClose();
          },
          onError(error, variables, context) {
            toast.error(t('inviteForm.unsuccessfullyInviteUser'), {
              position: 'top-right',
              autoClose: 2000,
              hideProgressBar: true,
            });
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
    [mutation, onClose],
  );
  return (
    <Modal
      open
      onClose={onClose}
      className="flex items-start justify-center py-20"
    >
      <section className="w-full max-w-xl bg-white rounded shadow">
        <header className="flex items-center gap-4 p-6 pb-0">
          <h2 className="flex-auto text-title font-semibold">
            {t('inviteForm.title')}
          </h2>
        </header>
        <div className="p-6">
          <UserInviteForm
            loading={mutation.isLoading}
            onClose={onClose}
            onSubmit={inviteUser}
          />
        </div>
      </section>
    </Modal>
  );
}

export default UserInviteDialog;
