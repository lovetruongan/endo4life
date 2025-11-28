import { useMutation, useQueryClient } from 'react-query';
import { TagApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

interface IDeleteTagParams {
  tagIds?: string[];
  tagDetailIds?: string[];
}

export function useDeleteTag() {
  const client = useQueryClient();

  const mutation = useMutation<void, Error, IDeleteTagParams>(
    async (params: IDeleteTagParams) => {
      const api = new TagApiImpl();
      await api.deleteTag(params.tagIds, params.tagDetailIds);
    },
    {
      onSuccess: () => {
        client.invalidateQueries(REACT_QUERY_KEYS.TAGS);
      },
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

