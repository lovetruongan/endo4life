import { useMutation } from 'react-query';
import { TagApiImpl } from '../api';
import { ITagFormData } from '../types';
import { CreateTagRequestDto } from '@endo4life/data-access';

export function useCreateTag() {
  const mutation = useMutation<void, Error, ITagFormData>(
    async (data: ITagFormData) => {
      const api = new TagApiImpl();
      const request: CreateTagRequestDto = {
        tag: data.tag || [],
        detailTag: data.detailTag || [],
        type: data.type,
      };
      await api.createTag(request);
    }
  );

  return {
    mutation,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

