import {
  IVideoCreateFormData,
  VideoMapper,
  useCreateVideo,
} from '@endo4life/feature-videos';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { VideoCreateForm } from './video-create-form';
import { useTranslation } from 'react-i18next';

export default function VideoCreatePage() {
  const { t } = useTranslation('video');
  const navigate = useNavigate();
  const videoMapper = new VideoMapper();
  const { mutation: createVideoMutation } = useCreateVideo();

  const createVideo = useCallback(
    (values: IVideoCreateFormData) => {
      if (!values.metadata || !values.files) {
        toast.error(t('errors.insufficientInfo'), {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      createVideoMutation.mutate(videoMapper.toCreateVideoRequest(values), {
        onSuccess(data) {
          toast.success(t('videoCreateForm.status.success'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.VIDEOS);
          }, 1000);
        },
        onError(error) {
          console.log(error);
          toast.error(t('videoCreateForm.status.error'), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      });
    },
    [createVideoMutation, navigate, videoMapper],
  );

  return (
    <div className="justify-center inline rounded shadow">
      <VideoCreateForm
        loading={createVideoMutation.isLoading}
        onSubmit={createVideo}
      />
    </div>
  );
}
