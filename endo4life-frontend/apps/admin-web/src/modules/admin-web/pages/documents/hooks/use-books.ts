import { useQuery } from 'react-query';
import { BookApiImpl } from '../api';
import { IBookEntity } from '../types';
import { DEFAULT_PAGINATION, REACT_QUERY_KEYS } from '../constants';

interface IBookData {
  loading: boolean;
  data: IBookEntity[] | undefined;
  pagination: {
    page: number;
    size: number;
    totalCount: number;
  };
  error: unknown;
  refetch: () => void;
}

export function useBooks(): IBookData {
  const { data, error, isFetching, refetch } = useQuery(
    [REACT_QUERY_KEYS.BOOKS],
    async () => {
      return new BookApiImpl().getBooks();
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  );

  return {
    loading: isFetching,
    data: data?.data,
    pagination: {
      page: (data?.pagination?.page ?? DEFAULT_PAGINATION.PAGE) + 1,
      size: data?.pagination?.size ?? DEFAULT_PAGINATION.SIZE,
      totalCount: data?.pagination?.totalCount ?? 0,
    },
    error,
    refetch,
  };
}

