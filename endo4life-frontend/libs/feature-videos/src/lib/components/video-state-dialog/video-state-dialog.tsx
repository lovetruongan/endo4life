import { Modal } from '@mui/material';
import { useTranslation } from 'react-i18next';
import VideoStateForm from './video-state-form';
import { useCallback } from 'react';
import { IVideoUpdateFormData } from '../../types';
import { toast } from 'react-toastify';
import { useUpdateVideo } from '../../hooks/use-update-video';
import { ResourceState } from '@endo4life/data-access';

interface Props {
  onClose(): void;
  videoId: string;
  state?: ResourceState;
}
export function VideoStateDialog({ videoId, state, onClose }: Props) {
  const { t } = useTranslation('video');
  const { mutation: updateVideoMutation } = useUpdateVideo({});
  const updateStateVideo = useCallback(
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
        onSuccess() {
          toast.success(t('videoStateDialog.state.success'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          onClose();
        },
        onError(error) {
          toast.error(t('videoStateDialog.state.error'), {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          console.error('Lỗi khi gọi API:', error);
        },
      });
    },
    [updateVideoMutation, onClose],
  );
  return (
    <Modal
      open
      onClose={onClose}
      className="flex items-start justify-center py-20"
    >
      <section className="w-full max-w-xl bg-white rounded shadow">
        <header className="flex items-center gap-4 p-6 pb-0">
          <h2 className="flex-auto font-semibold text-title">
            {t('videoFilter.selectDisplayPlaceholder')}
          </h2>
        </header>
        <div className="p-6">
          <VideoStateForm
            videoId={videoId}
            state={state}
            onClose={onClose}
            onSubmit={updateStateVideo}
          />
        </div>
      </section>
    </Modal>
  );
}

export default VideoStateDialog;
