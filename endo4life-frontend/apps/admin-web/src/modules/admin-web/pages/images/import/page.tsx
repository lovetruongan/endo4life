import {
  IImageCreateFormData,
  useImageImport,
} from '@endo4life/feature-image';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { ImageImportForm } from './image-import-form';
import { useTranslation } from 'react-i18next';

export default function ImageImportPage() {
  const { t } = useTranslation('image');
  const navigate = useNavigate();
  const { mutation: importImageMutation } = useImageImport();

  const importImage = useCallback(
    (values: IImageCreateFormData) => {
      if (values.type === 'MULTIPLE') {
        if (!values.metadata || !values.files) {
          toast.error(t('errors.insufficientInfo'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          return;
        }
      }
      importImageMutation.mutate(values, {
        onSuccess() {
          toast.success(t('imageImportForm.status.success'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.IMAGES);
          }, 1000);
        },
        onError(error) {
          toast.error(t('imageImportForm.status.error'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      });
    },
    [importImageMutation, navigate],
  );

  return (
    <div className="justify-center inline rounded shadow">
      <ImageImportForm
        loading={importImageMutation.isLoading}
        onSubmit={importImage}
      />
    </div>
  );
}
