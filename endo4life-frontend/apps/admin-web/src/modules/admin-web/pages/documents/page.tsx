import { useState } from 'react';
import { IoDocumentTextOutline, IoAddCircleOutline } from 'react-icons/io5';
import { 
  BookUploadModal, 
  BookEditModal,
  BookDetail,
  bookApi, 
  ICreateBookRequest, 
  IUpdateBookRequest,
  IBookEntity,
  useBooks 
} from '@endo4life/feature-book';
import { BookListAdmin } from './components/BookListAdmin';

export default function DocumentsPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<IBookEntity | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<IBookEntity | null>(null);

  // Lấy dữ liệu sách
  const { books, loading, error, refetch } = useBooks({
    page: 0,
    size: 100, // Lấy nhiều sách để hiển thị
  });

  const handleUploadBook = async (request: ICreateBookRequest, onProgress: (progress: number) => void) => {
    try {
      setUploadError(null);
      await bookApi.createBook(request, onProgress);
      setSuccessMessage('Tải sách lên thành công!');
      setUploadSuccess(true);
      
      // Refresh book list
      if (refetch) {
        await refetch();
      }
      
      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setUploadError(error.message || 'Có lỗi xảy ra khi tải sách lên');
      throw error;
    }
  };

  const handleEditBook = async (id: string, request: IUpdateBookRequest) => {
    try {
      setUploadError(null);
      await bookApi.updateBook(id, request);
      setSuccessMessage('Cập nhật sách thành công!');
      setUploadSuccess(true);
      
      // Refresh book list
      if (refetch) {
        await refetch();
      }
      
      setIsEditModalOpen(false);
      setSelectedBook(null);
      
      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setUploadError(error.message || 'Có lỗi xảy ra khi cập nhật sách');
      throw error;
    }
  };

  const handleDeleteBook = async (book: IBookEntity) => {
    try {
      setUploadError(null);
      await bookApi.deleteBook(book.id);
      setSuccessMessage('Xóa sách thành công!');
      setUploadSuccess(true);
      
      // Refresh book list
      if (refetch) {
        await refetch();
      }
      
      setDeleteConfirmBook(null);
      
      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      setUploadError(error.message || 'Có lỗi xảy ra khi xóa sách');
    }
  };

  const handleViewBook = (book: IBookEntity) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (book: IBookEntity) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (book: IBookEntity) => {
    setDeleteConfirmBook(book);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <IoDocumentTextOutline className="text-primary-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài liệu</h1>
              <p className="text-sm text-gray-500 mt-1">Quản lý sách và tài liệu trong hệ thống</p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <IoAddCircleOutline size={20} />
            Thêm Sách Mới
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
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
                {successMessage || 'Thao tác thành công!'}
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {successMessage.includes('Tải') 
                  ? 'Sách của bạn đã được thêm vào hệ thống và sẵn sàng để sử dụng.'
                  : successMessage.includes('Cập nhật')
                  ? 'Thông tin sách đã được cập nhật thành công.'
                  : 'Sách đã được xóa khỏi hệ thống.'}
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

        {/* Books List */}
        <BookListAdmin
          books={books}
          loading={loading}
          onView={handleViewBook}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

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
              onClick={() => refetch && refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tải lại
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <BookUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadBook}
      />

      {/* Edit Modal */}
      <BookEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        onSubmit={handleEditBook}
      />

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => {
              setIsDetailModalOpen(false);
              setSelectedBook(null);
            }}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">Chi tiết Sách</h2>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedBook(null);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <BookDetail bookId={selectedBook.id} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  Xác nhận xóa sách
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Bạn có chắc chắn muốn xóa sách <span className="font-semibold">"{deleteConfirmBook.title}"</span>? 
                  Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmBook(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleDeleteBook(deleteConfirmBook)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
