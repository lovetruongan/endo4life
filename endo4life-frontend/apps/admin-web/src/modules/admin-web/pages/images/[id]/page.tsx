import { useCallback } from 'react';
import { useParams } from 'react-router';
import { ImageDetailForm } from './image-detail-form';
import { toast } from 'react-toastify';
import {
  IImageEntity,
  IImageUpdateFormData,
  ImageMapper,
  useImageGetById,
  useImageUpdate,
} from '@endo4life/feature-image';
import { objectUtils } from '@endo4life/util-common';
import { useTranslation } from 'react-i18next';

export default function ImageDetailPage() {
  const { t } = useTranslation('image');
  const { id = '' } = useParams<{ id: string }>();
  const { data, loading, refetch } = useImageGetById(id);
  const { mutation: updateImageMutation } = useImageUpdate();

  const updateImage = useCallback(
    (formData: IImageUpdateFormData) => {
      const partialFormData = ImageMapper.getInstance().toPartialUpdateFormData(
        formData,
        data?.data || ({} as IImageEntity),
      );
      if (!partialFormData.id) {
        toast.error(t('errors.invalidImageId'), {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      updateImageMutation.mutate(partialFormData, {
        onSuccess(_data) {
          toast.success(t('imageDetailForm.status.success'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          refetch();
        },
        onError(_error) {
          toast.error(t('imageDetailForm.status.error'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
        },
      });
    },
    [updateImageMutation, data?.data, refetch],
  );

  return (
    <div className="justify-center inline">
      {!loading && data && (
        <ImageDetailForm
          loading={updateImageMutation.isLoading}
          formData={ImageMapper.getInstance().toUpdateFormData(
            objectUtils.defaultObject(data.data),
          )}
          onSubmit={updateImage}
        />
      )}
    </div>
  );
}
