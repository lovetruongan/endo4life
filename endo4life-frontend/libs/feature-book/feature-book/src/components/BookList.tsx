import React from 'react';
import { useBooks } from '../hooks/useBooks';
import { BookCard } from './BookCard';
import { IBookFilter, IBookEntity } from '../types';

interface BookListProps {
  filter?: IBookFilter;
  onBookClick?: (book: IBookEntity) => void;
}

export const BookList: React.FC<BookListProps> = ({ filter, onBookClick }) => {
  const { books, loading, error, totalCount, updateFilter } = useBooks(filter);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Lỗi: {error.message}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-gray-500 text-center p-8">
        Không có sách nào
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-gray-600">
        Tổng số: {totalCount} sách
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map(book => (
          <BookCard key={book.id} book={book} onClick={onBookClick} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => updateFilter({ page: Math.max(0, (filter?.page ?? 0) - 1) })}
          disabled={(filter?.page ?? 0) === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trang trước
        </button>
        <span className="px-4 py-2">
          Trang {(filter?.page ?? 0) + 1}
        </span>
        <button
          onClick={() => updateFilter({ page: (filter?.page ?? 0) + 1 })}
          disabled={books.length < (filter?.size ?? 20)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trang sau →
        </button>
      </div>
    </div>
  );
};

