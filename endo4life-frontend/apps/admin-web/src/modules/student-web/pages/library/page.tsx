import { useState, useMemo } from 'react';
import { BookList } from './components/BookList';
import { BookFilters, BookFilterOptions } from './components/BookFilters';
import { IoLibraryOutline } from 'react-icons/io5';
import { SAMPLE_BOOKS } from './sample-data';

export function LibraryPage() {
  const [filters, setFilters] = useState<BookFilterOptions>({
    search: '',
    category: '',
    sortBy: 'newest',
  });

  // State để quản lý loading (sẽ dùng khi có API)
  const [loading] = useState(false);

  // Filter và sort books dựa trên filters
  const filteredBooks = useMemo(() => {
    let result = [...SAMPLE_BOOKS];

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author?.toLowerCase().includes(searchLower) ||
          book.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (filters.category) {
      result = result.filter((book) => book.category === filters.category);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => (b.publishYear || 0) - (a.publishYear || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
    }

    return result;
  }, [filters]);

  const handleFilterChange = (newFilters: BookFilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="px-4 sm:px-10 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <IoLibraryOutline size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Thư viện của tôi</h1>
              <p className="text-primary-100 text-lg">
                Khám phá bộ sưu tập sách y khoa đa dạng và phong phú
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{filteredBooks.length}</div>
              <div className="text-primary-100 text-sm">Sách có sẵn</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {new Set(SAMPLE_BOOKS.map((b) => b.category)).size || 0}
              </div>
              <div className="text-primary-100 text-sm">Danh mục</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {SAMPLE_BOOKS.reduce((sum, book) => sum + (book.views || 0), 0)}
              </div>
              <div className="text-primary-100 text-sm">Lượt xem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-10 py-8">
        {/* Filters */}
        <BookFilters onFilterChange={handleFilterChange} />

        {/* Books List */}
        <div className="mt-6">
          {filters.search || filters.category ? (
            <div className="mb-4">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold text-gray-900">{filteredBooks.length}</span> kết quả
              </p>
            </div>
          ) : null}
          
          <BookList books={filteredBooks} loading={loading} />
        </div>

        {/* Info Box - Hiển thị khi chưa có dữ liệu */}
        {!loading && SAMPLE_BOOKS.length === 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <IoLibraryOutline className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Thư viện đang được xây dựng
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi đang tích cực bổ sung các tài liệu, sách y khoa chất lượng cao vào thư viện. 
              Hãy quay lại sau để khám phá những nguồn tài liệu hữu ích!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
