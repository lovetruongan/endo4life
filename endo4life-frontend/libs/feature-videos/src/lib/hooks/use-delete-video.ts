import { useMutation, useQueryClient } from 'react-query';
import { VideoApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

interface DeleteVideoParams {
  id: string;
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, unknown, DeleteVideoParams>({
    mutationFn: async ({ id }: DeleteVideoParams) => {
      const api = new VideoApiImpl();
      await api.deleteVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries([REACT_QUERY_KEYS.VIDEOS]);
      console.log('Video deleted successfully.');
    },
    onError: (error) => {
      console.error('Error deleting video:', error);
    },
  });

  return { mutation };
}
