import {
  IImageCreateFormData,
  ImageMapper,
  useImageCreate,
} from '@endo4life/feature-image';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { ImageCreateForm } from './image-create-form';
import { useTranslation } from 'react-i18next';

export default function ImageCreatePage() {
  const { t } = useTranslation('image');

  const navigate = useNavigate();
  const { mutation: createImageMutation } = useImageCreate();

  const createImage = useCallback(
    (values: IImageCreateFormData) => {
      if (!values.metadata || !values.files) {
        toast.error(t('errors.insufficientInfo'), {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      createImageMutation.mutate(
        ImageMapper.getInstance().toCreateImageRequest(values),
        {
          onSuccess(data) {
            toast.success(t('imageCreateForm.status.success'), {
              position: 'top-right',
              autoClose: 2000,
              hideProgressBar: true,
            });
            setTimeout(() => {
              navigate(ADMIN_WEB_ROUTES.IMAGES);
            }, 1000);
          },
          onError(error) {
            console.log(error);
            toast.error(t('imageCreateForm.status.error'), {
              position: 'top-right',
              autoClose: 2000,
              hideProgressBar: true,
            });
          },
        },
      );
    },
    [createImageMutation, navigate],
  );

  return (
    <div className="justify-center inline rounded shadow">
      <ImageCreateForm
        loading={createImageMutation.isLoading}
        onSubmit={createImage}
      />
    </div>
  );
}
