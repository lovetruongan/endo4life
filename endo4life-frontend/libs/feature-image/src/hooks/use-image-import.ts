import { useMutation, useQueryClient } from 'react-query';
import { ImageApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';
import { IImageCreateFormData } from '../types';

export function useImageImport() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: IImageCreateFormData) => {
      const api = new ImageApiImpl();
      return api.importFileImage(data);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.CREATE_IMAGE]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
