import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@mui/material';
import { Button } from '@endo4life/ui-common';
import clsx from 'clsx';
import { useToggle } from 'ahooks';
import UserDeleteConfirmPassword from './user-delete-confirm-password-dialog';

interface Props {
  id: string;
  onClose(): void;
}
export function UserDeleteConfirmDialog({ id, onClose }: Props) {
  const { t } = useTranslation(['common', 'user']);
  const [open, openDialogAction] = useToggle(false);

  const handleOnCancel = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      evt.preventDefault();
      evt.stopPropagation();
      onClose();
    },
    [onClose],
  );

  const handleOnConfirm = useCallback(() => {
    openDialogAction.toggle();
  }, [openDialogAction]);

  return (
    <>
      <Modal
        open
        onClose={onClose}
        className={clsx({
          'flex items-start justify-center py-20': true,
        })}
      >
        <section className="w-full max-w-xl bg-white rounded-lg shadow">
          <header className="flex items-center gap-4 px-6 py-3">
            <h2 className="flex-auto pt-4 text-2xl font-semibold">
              {t('user:userDeleteAccount')} ?
            </h2>
          </header>
          <div className="px-6 pt-4 space-y-2 min-h-24">
            <p>
              {t('user:deleteDialog.confirmationMessage')}{' '}
              {t('user:deleteDialog.cannotRestore')}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 pb-4">
            <Button
              text={t('common:txtConfirm')}
              type="submit"
              variant="fill"
              className="px-3 py-2 text-sm font-bold bg-red-700"
              onClick={handleOnConfirm}
            />
            <Button
              onClick={(evt) => handleOnCancel(evt)}
              text={t('common:txtCancel')}
              className="px-3 text-sm font-bold text-black border-gray-200 hover:bg-opacity-70"
              variant="outline"
            />
          </div>
        </section>
      </Modal>
      {open && (
        <UserDeleteConfirmPassword
          id={id}
          onClose={openDialogAction.setLeft}
          onCloseConfirmDeleteDialog={onClose}
        />
      )}
    </>
  );
}

export default UserDeleteConfirmDialog;
