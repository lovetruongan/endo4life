import { useMutation, useQueryClient } from 'react-query';
import { BookApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

interface CreateBookParams {
  title: string;
  author?: string;
  description?: string;
  file?: File;
  cover?: File;
}

export function useBookCreate() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (params: CreateBookParams) => {
      return new BookApiImpl().createBook(
        params.title,
        params.author,
        params.description,
        params.file,
        params.cover,
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([REACT_QUERY_KEYS.BOOKS]);
      },
    },
  );

  return { mutation };
}

