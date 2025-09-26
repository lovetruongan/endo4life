import { useMutation, useQueryClient } from 'react-query';
import { REACT_QUERY_KEYS } from '../constants';
import { IVideoUpdateFormData } from '../types';
import { VideoApiImpl } from '../api';
import { useTranslation } from 'react-i18next';

interface Props {}

export function useUpdateVideo({}: Props) {
  const { t } = useTranslation('video');
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: IVideoUpdateFormData) => {
      console.log('useUpdateVideo data', data);
      if (!data.id) {
        throw new Error(t('errors.invalidVideoId'));
      }
      const api = new VideoApiImpl();
      const response = await api.updateVideo(data);
      return response;
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.VIDEOS]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
