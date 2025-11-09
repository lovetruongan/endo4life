import {
  IImageCreateFormData,
  useImageImport,
  useZipUploadProgress,
} from '@endo4life/feature-image';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { ImageImportForm } from './image-import-form';
import { useTranslation } from 'react-i18next';

export default function ImageImportPage() {
  const { t } = useTranslation('image');
  const navigate = useNavigate();
  const { mutation: importImageMutation } = useImageImport();
  const { sessionId, progress, isUploading, resetProgress } = useZipUploadProgress();

  // Handle progress updates
  useEffect(() => {
    if (progress?.status === 'SUCCESS') {
      toast.success(progress.message || t('imageImportForm.status.success'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
      setTimeout(() => {
        resetProgress();
        navigate(ADMIN_WEB_ROUTES.IMAGES);
      }, 2000);
    } else if (progress?.status === 'FAILED') {
      toast.error(progress.message || t('imageImportForm.status.error'), {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
      });
      resetProgress();
    }
  }, [progress, navigate, resetProgress, t]);

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

      // For ZIP imports, pass the session ID
      const isZipImport = values.type === 'COMPRESSED';
      importImageMutation.mutate(
        { data: values, sessionId: isZipImport ? sessionId : undefined },
        {
          onSuccess() {
            if (!isZipImport) {
              toast.success(t('imageImportForm.status.success'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: true,
              });
              setTimeout(() => {
                navigate(ADMIN_WEB_ROUTES.IMAGES);
              }, 1000);
            }
            // For ZIP imports, success is handled by WebSocket progress
          },
          onError(error) {
            toast.error(t('imageImportForm.status.error'), {
              position: 'top-right',
              autoClose: 2000,
              hideProgressBar: true,
            });
          },
        }
      );
    },
    [importImageMutation, navigate, sessionId, t],
  );

  return (
    <div className="justify-center inline rounded shadow">
      <ImageImportForm
        loading={importImageMutation.isLoading || isUploading}
        onSubmit={importImage}
        progress={progress}
      />
    </div>
  );
}
