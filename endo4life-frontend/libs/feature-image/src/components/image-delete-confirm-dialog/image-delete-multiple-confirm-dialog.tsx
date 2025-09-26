import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { Modal } from '@mui/material';
import { Button } from '@endo4life/ui-common';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useDeleteImages } from '../../hooks/use-image-delete-multiple';
import { IImageEntity } from '../../types';

interface Props {
  images: IImageEntity[] | undefined;
  onClose(): void;
}

export function ImageDeleteMultipleConfirmDialog({ images, onClose }: Props) {
  const { t } = useTranslation(['common', 'image']);
  const { mutation } = useDeleteImages();

  const handleDelete = useCallback(() => {
    if (images && images.length > 0) {
      mutation.mutate(
        images.map((image) => image.id),
        {
          onSuccess: () => {
            toast.success(
              t('image:imageDeleteMultipleConfirmDialog.status.success', {
                count: images.length,
              }),
            );
            onClose();
          },

          onError: (error) => {
            toast.error(
              t('image:imageDeleteMultipleConfirmDialog.status.error'),
            );
            console.error('Delete Images Error:', error);
          },
        },
      );
    }
  }, [mutation, images, t, onClose]);

  const handleOnCancel = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      evt.preventDefault();
      evt.stopPropagation();
      onClose();
    },
    [onClose],
  );

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
            {t('image:actions.deleteImageMutiple')}
          </h2>
        </header>
        <div className="py-4 space-y-2">
          <p>
            {t('image:imageDeleteMultipleConfirmDialog.confirmationMessage', {
              count: images?.length,
            })}
          </p>
          <p>{t('image:imageDeleteMultipleConfirmDialog.cannotRestore')}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            text={t('common:txtConfirm')}
            type="submit"
            variant="fill"
            requesting={mutation.isLoading}
            disabled={mutation.isLoading}
            className="px-6 py-3 text-sm font-bold bg-red-700"
            onClick={handleDelete}
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
