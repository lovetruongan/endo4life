import { useMutation, useQueryClient } from 'react-query';
import { BookApiImpl } from '../api';
import { REACT_QUERY_KEYS } from '../constants';

export function useBookDelete() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (id: string) => {
      return new BookApiImpl().deleteBook(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([REACT_QUERY_KEYS.BOOKS]);
      },
    },
  );

  return { mutation };
}

