import { useMutation, useQueryClient } from 'react-query';
import { VideoApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useDeleteVideos() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (videoIds: string[]) => {
      const api = new VideoApiImpl();
      return await api.deleteVideos(videoIds);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([REACT_QUERY_KEYS.VIDEOS]);
      },
      onError: (error) => {
        console.error('Error deleting videos:', error);
      },
    }
  );

  return { mutation };
}
