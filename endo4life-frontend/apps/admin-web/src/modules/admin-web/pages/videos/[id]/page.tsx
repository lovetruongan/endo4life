import { useCallback } from 'react';
import { useParams } from 'react-router';
import { VideoDetailForm } from './video-detail-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  IVideoEntity,
  IVideoUpdateFormData,
  VideoMapper,
  useVideoGetById,
  useUpdateVideo,
} from '@endo4life/feature-videos';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { objectUtils } from '@endo4life/util-common';
import { useTranslation } from 'react-i18next';

export default function VideoDetailPage() {
  const { t } = useTranslation('video');
  const navigate = useNavigate();
  const videoMapper = new VideoMapper();
  const { id = '' } = useParams<{ id: string }>();
  const { data, loading } = useVideoGetById(id);
  const { mutation: updateVideoMutation } = useUpdateVideo({});

  const updateVideo = useCallback(
    (values: IVideoUpdateFormData) => {
      if (!values.id) {
        toast.error(t('errors.invalidVideoId'), {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      updateVideoMutation.mutate(values, {
        onSuccess(data) {
          toast.success(t('videoDetailForm.status.success'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.VIDEOS);
          }, 1000);
        },
        onError(error) {
          toast.error(t('videoDetailForm.status.error'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
        },
      });
    },
    [updateVideoMutation, navigate],
  );

  return (
    <div className="justify-center inline">
      {!loading && data && (
        <VideoDetailForm
          loading={updateVideoMutation.isLoading}
          rawData={objectUtils.defaultObject(data.data)}
          formData={videoMapper.toUpdateFormData(data.data!)}
          onSubmit={updateVideo}
        />
      )}
    </div>
  );
}
