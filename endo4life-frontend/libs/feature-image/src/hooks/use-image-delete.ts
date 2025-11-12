import { useMutation, useQueryClient } from 'react-query';
import { REACT_QUERY_KEYS } from '../constants';
import { ImageApiImpl } from '../api';

export function useImageDelete() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const api = new ImageApiImpl();
      return api.deleteImage(id);
    },
    onSuccess(data) {
      // Refresh the images list after deletion to prevent stale rows causing follow-up errors
      client.invalidateQueries([REACT_QUERY_KEYS.IMAGES]);
      console.log('data', data);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
