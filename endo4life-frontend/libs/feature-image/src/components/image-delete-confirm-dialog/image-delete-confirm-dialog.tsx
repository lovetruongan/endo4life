import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageDelete } from '../../hooks';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { Modal } from '@mui/material';
import clsx from 'clsx';
import { Button } from '@endo4life/ui-common';

interface Props {
  id: string;
  onClose(): void;
}

export function ImageDeleteConfirmDialog({ id, onClose }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'image']);
  const { mutation } = useImageDelete();

  const deleteImage = useCallback(async () => {
    if (!id) {
      toast.error(t('image:errors.invalidVideoId'), {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }
    mutation.mutate(
      { id },
      {
        onSuccess(data, variables, context) {
          toast.success(t('image:imageDeleteConfirmDialog.status.success'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.IMAGES);
          }, 2000);
        },
        onError(error, variables, context) {
          toast.error(t('image:imageDeleteConfirmDialog.status.error'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      },
    );
  }, [mutation, onClose, id, navigate, t]);

  const handleOnCancel = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      evt.preventDefault();
      evt.stopPropagation();
      onClose();
    },
    [onClose],
  );

  const handleOnConfirm = useCallback(() => {
    deleteImage();
  }, []);

  return (
    <Modal
      open
      onClose={() => {
        if (!mutation.isLoading) onClose();
      }}
      className={clsx({
        'flex items-start justify-center py-20': true,
        'pointer-events-none': mutation.isLoading,
      })}
    >
      <section className="w-full max-w-xl px-6 py-6 bg-white rounded-lg shadow">
        <header className="flex items-center gap-4">
          <h2 className="flex-auto text-2xl font-semibold">
            {' '}
            {t('image:imageDeleteConfirmDialog.title')}
          </h2>
        </header>
        <div className="py-4 space-y-2">
          <p>{t('image:imageDeleteConfirmDialog.confirmationMessage')}</p>
          <p>{t('image:imageDeleteConfirmDialog.cannotRestore')}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            text={t('common:txtConfirm')}
            type="submit"
            variant="fill"
            requesting={mutation.isLoading}
            disabled={mutation.isLoading}
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
  );
}
