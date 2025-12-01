import { useState } from 'react';
import { BookList } from './components/BookList';
import { BookFilters, BookFilterOptions } from './components/BookFilters';
import { useBooks } from './hooks/use-books';
import { IoLibraryOutline } from 'react-icons/io5';

export function LibraryPage() {
  const [filters, setFilters] = useState<BookFilterOptions>({
    search: '',
    category: '',
    sortBy: 'newest',
  });

  // Fetch books from API using the hook
  const { data: books, loading } = useBooks(filters);

  const handleFilterChange = (newFilters: BookFilterOptions) => {
    setFilters(newFilters);
  };

  const isLibraryEmpty = !loading && books.length === 0 && !filters.search && !filters.category;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 text-white">
            <IoLibraryOutline size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Thư viện
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Khám phá và đọc sách y khoa trực tuyến
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <BookFilters onFilterChange={handleFilterChange} />

        {/* Results Info */}
        {!loading && (filters.search || filters.category) && books.length > 0 && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <span>Tìm thấy</span>
            <span className="font-semibold text-gray-900">{books.length}</span>
            <span>kết quả phù hợp</span>
          </div>
        )}

        {/* Content */}
        {isLibraryEmpty ? (
          <div className="mt-12 text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
              <IoLibraryOutline className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Thư viện đang được cập nhật
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Chúng tôi đang tích cực bổ sung các đầu sách mới.
              Vui lòng quay lại sau!
            </p>
          </div>
        ) : (
          <BookList books={books} loading={loading} />
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
