import { useMutation, useQueryClient } from 'react-query';
import { ImageApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useDeleteImages() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (imageIds: string[]) => {
      const api = new ImageApiImpl();
      return await api.deleteImages(imageIds);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([REACT_QUERY_KEYS.IMAGES]);
      },
      onError: (error) => {
        console.error('Error deleting images:', error);
      },
    }
  );

  return { mutation };
}
