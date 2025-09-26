import { useMutation, useQueryClient } from 'react-query';
import { REACT_QUERY_KEYS } from '../constants';
import { IImageUpdateFormData } from '../types';
import { ImageApiImpl } from '../api';
import { useTranslation } from 'react-i18next';

export function useImageUpdate() {
  const { t } = useTranslation('image');
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: IImageUpdateFormData) => {
      if (!data.id) {
        throw new Error(t('errors.invalidImageId'));
      }
      const api = new ImageApiImpl();
      const response = await api.updateImage(data);
      return response;
    },
    onSuccess() {
      client.invalidateQueries([REACT_QUERY_KEYS.IMAGES]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}
