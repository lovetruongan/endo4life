import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  IVideoCreateFormData,
  useVideoImport,
} from '@endo4life/feature-videos';
import { VideoImportForm } from './video-import-form';
import { useTranslation } from 'react-i18next';

export default function VideoImportPage() {
  const { t } = useTranslation('video');
  const navigate = useNavigate();
  const { mutation: importVideoMutation } = useVideoImport();

  const importVideo = useCallback(
    (values: IVideoCreateFormData) => {
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
      importVideoMutation.mutate(values, {
        onSuccess() {
          toast.success(t('videoImportForm.status.success'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.VIDEOS);
          }, 1000);
        },
        onError(error) {
          toast.error(t('videoImportForm.status.error'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      });
    },
    [importVideoMutation, navigate],
  );

  return (
    <div className="justify-center inline rounded shadow">
      <VideoImportForm
        loading={importVideoMutation.isLoading}
        onSubmit={importVideo}
      />
    </div>
  );
}
