import { BookCard, Book } from './BookCard';
import { Fragment } from 'react';
import { IoLibraryOutline } from 'react-icons/io5';

interface BookListProps {
  books: Book[];
  loading?: boolean;
}

export function BookList({ books, loading }: BookListProps) {
  if (loading) {
    return <BookListSkeleton />;
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
          <IoLibraryOutline className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không tìm thấy sách
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm kết quả phù hợp
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

function BookListSkeleton() {
  return (
    <Fragment>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Cover Skeleton */}
            <div className="aspect-[2/3] bg-gray-100 animate-pulse" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="pt-3 border-t border-gray-50 flex justify-between">
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Fragment>
  );
}

export default BookList;
