// File này sẽ được sử dụng khi có API backend

import { useQuery } from 'react-query';
import { Book } from '../components/BookCard';
import { BookFilterOptions } from '../components/BookFilters';

const REACT_QUERY_KEY = 'LIBRARY_BOOKS';

/**
 * Hook để lấy danh sách sách từ API
 * TODO: Implement khi có backend API
 */
export function useBooks(filters: BookFilterOptions) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, filters],
    async () => {
      // TODO: Replace with actual API call
      // const api = new LibraryApiImpl();
      // return api.getBooks(filters);
      
      // Tạm thời trả về empty array
      return [] as Book[];
    },
    {
      enabled: false, // Disable until API is ready
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return {
    data: data || [],
    loading: isLoading,
    error,
    refetch,
  };
}

/**
 * Hook để lấy chi tiết một cuốn sách
 * TODO: Implement khi có backend API
 */
export function useBookDetail(bookId: string) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, 'detail', bookId],
    async () => {
      // TODO: Replace with actual API call
      // const api = new LibraryApiImpl();
      // return api.getBookById(bookId);
      
      return null as Book | null;
    },
    {
      enabled: false, // Disable until API is ready
      refetchOnWindowFocus: false,
    }
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
}

/**
 * Hook để tăng view count khi xem sách
 * TODO: Implement khi có backend API
 */
export function useRecordBookView() {
  return {
    recordView: async (bookId: string) => {
      // TODO: Replace with actual API call
      // const api = new LibraryApiImpl();
      // return api.recordBookView(bookId);
      console.log('Record view for book:', bookId);
    },
  };
}

