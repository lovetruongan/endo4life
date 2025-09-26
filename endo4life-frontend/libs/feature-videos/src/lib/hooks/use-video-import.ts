import { useMutation, useQueryClient } from 'react-query';
import { VideoApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { IVideoCreateFormData } from '../types';

export function useVideoImport() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: IVideoCreateFormData) => {
      const api = new VideoApiImpl();
      return api.importFileVideo(data);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.CREATE_VIDEO]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
