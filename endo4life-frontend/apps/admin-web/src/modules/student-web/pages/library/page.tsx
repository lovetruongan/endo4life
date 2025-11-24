import { useState, useMemo } from 'react';
import { BookList } from './components/BookList';
import { BookFilters, BookFilterOptions } from './components/BookFilters';
import { IoLibraryOutline, IoAddCircleOutline } from 'react-icons/io5';
import { useBooks, BookUploadModal, bookApi, ICreateBookRequest } from '@endo4life/feature-book';
import { adaptBookEntitiesToBooks } from './adapters/book-adapter';

export function LibraryPage() {
  const [filters, setFilters] = useState<BookFilterOptions>({
    search: '',
    category: '',
    sortBy: 'newest',
  });
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lấy dữ liệu từ backend
  const { books: bookEntities, loading, error, totalCount, refetch } = useBooks({
    page: 0,
    size: 100, // Lấy nhiều sách để filter ở client
    sort: filters.sortBy === 'newest' ? 'createdAt,desc' : 
          filters.sortBy === 'popular' ? 'viewNumber,desc' : 
          'title,asc',
  });

  // Convert IBookEntity sang Book interface
  const allBooks = useMemo(() => {
    return adaptBookEntitiesToBooks(bookEntities);
  }, [bookEntities]);

  // Filter và sort books dựa trên filters
  const filteredBooks = useMemo(() => {
    let result = [...allBooks];

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

    // Sort (đã sort ở backend, nhưng giữ lại để tương thích)
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
  }, [allBooks, filters]);

  const handleFilterChange = (newFilters: BookFilterOptions) => {
    setFilters(newFilters);
  };

  const handleUploadBook = async (request: ICreateBookRequest, onProgress: (progress: number) => void) => {
    try {
      setUploadError(null);
      await bookApi.createBook(request, onProgress);
      setUploadSuccess(true);
      
      // Refresh book list
      if (refetch) {
        await refetch();
      }
      
      // Auto hide success message after 5 seconds
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error: any) {
      setUploadError(error.message || 'Có lỗi xảy ra khi tải sách lên');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="px-4 sm:px-10 py-12">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
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
            {/* Nút thêm sách đã bị ẩn */}
            {/* <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-lg hover:bg-primary-50 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              <IoAddCircleOutline size={24} />
              Thêm Sách Mới
            </button> */}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {loading ? '...' : totalCount || filteredBooks.length}
              </div>
              <div className="text-primary-100 text-sm">Sách có sẵn</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {loading ? '...' : new Set(allBooks.map((b) => b.category)).size || 0}
              </div>
              <div className="text-primary-100 text-sm">Danh mục</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">
                {loading ? '...' : allBooks.reduce((sum, book) => sum + (book.views || 0), 0)}
              </div>
              <div className="text-primary-100 text-sm">Lượt xem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-10 py-8">
        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-800">
                Tải sách lên thành công!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Sách của bạn đã được thêm vào thư viện và sẵn sàng để sử dụng.
              </p>
            </div>
            <button
              onClick={() => setUploadSuccess(false)}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                Lỗi tải sách lên
              </h3>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

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

        {/* Error State */}
        {error && !loading && (
          <div className="mt-12 bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Không thể tải dữ liệu
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-4">
              {error.message || 'Đã có lỗi xảy ra khi tải dữ liệu sách. Vui lòng thử lại sau.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        )}

        {/* Info Box - Hiển thị khi chưa có dữ liệu */}
        {!loading && !error && allBooks.length === 0 && (
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

      {/* Upload Modal */}
      <BookUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadBook}
      />
    </div>
  );
}

export default LibraryPage;
