import { useState, useEffect } from 'react';
import { bookApi } from '../api/book-api';
import { IBookEntity } from '../types';

export const useBookDetail = (bookId: string | undefined) => {
  const [book, setBook] = useState<IBookEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBook = async () => {
    if (!bookId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await bookApi.getBookById(bookId);
      setBook(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const refetch = () => {
    fetchBook();
  };

  return {
    book,
    loading,
    error,
    refetch
  };
};

