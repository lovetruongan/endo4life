import { Modal } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ImageStateForm from './image-state-form';
import { useCallback } from 'react';
import { IImageUpdateFormData } from '../../types';
import { toast } from 'react-toastify';
import { useImageUpdate } from '../../hooks/use-image-update';
import { useImageGetById } from '../../hooks/use-image-get-by-id';
import { ResourceState } from '@endo4life/data-access';

interface Props {
  onClose(): void;
  imageId: string;
  state?: ResourceState;
}
export function ImageStateDialog({ imageId, state, onClose }: Props) {
  const { t } = useTranslation('image');
  const { data: imageData, loading } = useImageGetById(imageId);
  const { mutation: updateImageMutation } = useImageUpdate();
  const updateStateImage = useCallback(
    (values: IImageUpdateFormData) => {
      if (!values.id) {
        toast.error(t('errors.invalidImageId'), {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }

      // Merge with existing data to preserve tags and other fields
      const existingData = imageData?.data;
      const mergedValues: IImageUpdateFormData = {
        ...values,
        metadata: {
          ...values.metadata,
          title: existingData?.metadata?.title || values.metadata?.title || '',
          description:
            existingData?.metadata?.description || values.metadata?.description,
          tag: existingData?.tag || [],
          detailTag: existingData?.detailTag || [],
        },
      };

      updateImageMutation.mutate(mergedValues, {
        onSuccess() {
          toast.success(t('imageStateDialog.status.success'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          onClose();
        },
        onError(error) {
          toast.error(t('imageStateDialog.status.error'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          console.error('Lỗi khi gọi API:', error);
        },
      });
    },
    [updateImageMutation, onClose, imageData, t],
  );

  if (loading) {
    return null; // or show loading spinner
  }

  return (
    <Modal
      open
      onClose={onClose}
      className="flex items-start justify-center py-20"
    >
      <section className="w-full max-w-xl bg-white rounded shadow">
        <header className="flex items-center gap-4 p-6 pb-0">
          <h2 className="flex-auto font-semibold text-title">
            {t('imageFilter.selectDisplayPlaceholder')}
          </h2>
        </header>
        <div className="p-6">
          <ImageStateForm
            imageId={imageId}
            state={state}
            onClose={onClose}
            onSubmit={updateStateImage}
          />
        </div>
      </section>
    </Modal>
  );
}

export default ImageStateDialog;
