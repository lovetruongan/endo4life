import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { Modal } from '@mui/material';
import { Button } from '@endo4life/ui-common';
import clsx from 'clsx';
import { IUserEntity } from '../../types';
import { useToggle } from 'ahooks';
import { UserDeleteMultipleConfirmPassword } from './user-delete-multiple-confirm-password-dialog';

interface Props {
  users: IUserEntity[] | undefined;
  onClose(): void;
}

export function UserDeleteMultipleConfirmDialog({ users, onClose }: Props) {
  const { t } = useTranslation('user');
  const [openConfirmPassDialog, confirmPassDialogToggle] = useToggle(false);

  const handleOnCancel = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      evt.preventDefault();
      evt.stopPropagation();
      onClose();
    },
    [onClose],
  );

  const handleOnConfirm = useCallback(() => {
    confirmPassDialogToggle.toggle();
  }, [confirmPassDialogToggle]);

  return (
    <>
      <Modal
        open
        onClose={onClose}
        className={clsx({
          'flex items-start justify-center py-20': true,
        })}
      >
        <section className="w-full max-w-xl px-6 py-6 bg-white rounded-lg shadow">
          <header className="flex items-center gap-4">
            <h2 className="flex-auto text-2xl font-semibold">
              {t('actions.txtRemoveUserMultiple')}
            </h2>
          </header>
          <div className="py-4 space-y-2">
            <p>
              {t('deleteDialog.confirmationMessageMultiple').replace(
                '{{count}}',
                `${users?.length}`,
              )}
              <br />
              {t('deleteDialog.cannotRestore')}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              text={t('common:txtConfirm')}
              type="submit"
              variant="fill"
              className="px-6 py-3 text-sm font-bold bg-red-700"
              onClick={handleOnConfirm}
            />
            <Button
              onClick={(evt) => handleOnCancel(evt)}
              text={t('common:txtCancel')}
              className="px-6 py-3 text-sm font-bold text-black border-gray-200 hover:bg-opacity-70"
              variant="outline"
            />
          </div>
        </section>
      </Modal>
      {openConfirmPassDialog && (
        <UserDeleteMultipleConfirmPassword
          users={users || []}
          onClose={confirmPassDialogToggle.setLeft}
          onCloseConfirmDeleteDialog={onClose}
        />
      )}
    </>
  );
}
