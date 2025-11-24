import { useState, useEffect } from 'react';
import { bookApi } from '../api/book-api';
import { IBookEntity, IBookFilter } from '../types';

export const useBooks = (initialFilter?: IBookFilter) => {
  const [books, setBooks] = useState<IBookEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<IBookFilter>(initialFilter ?? {});

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bookApi.getBooks(filter);
      setBooks(response.data ?? []);
      setTotalCount(response.pagination.totalCount);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [JSON.stringify(filter)]);

  const refetch = () => {
    fetchBooks();
  };

  const updateFilter = (newFilter: Partial<IBookFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  return {
    books,
    loading,
    error,
    totalCount,
    filter,
    updateFilter,
    refetch
  };
};

