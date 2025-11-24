import { useState, useEffect } from 'react';
import { IoCloseOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface BookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookUrl: string;
  bookTitle: string;
}

export function BookPreviewModal({ isOpen, onClose, bookUrl, bookTitle }: BookPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const maxPages = 3; // Chỉ cho xem 3 trang đầu

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setLoading(true);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < maxPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Không thể tải file xem trước. Vui lòng thử lại sau.');
  };

  // Create iframe URL with page parameter for PDF
  const getPreviewUrl = () => {
    if (!bookUrl) return '';
    
    // For PDF files, we can add page parameter
    const url = new URL(bookUrl);
    url.hash = `page=${currentPage}`;
    return url.toString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-xl">
            <div className="flex-1">
              <h2 className="text-xl font-bold line-clamp-1">{bookTitle}</h2>
              <p className="text-sm text-primary-100 mt-1">
                Xem trước - Trang {currentPage} / {maxPages}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <IoCloseOutline size={28} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 relative bg-gray-100 overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải xem trước...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center max-w-md px-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium mb-2">Lỗi tải file</p>
                  <p className="text-gray-600 text-sm">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* PDF Preview using iframe or embed */}
            {bookUrl && !error && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full h-full overflow-hidden">
                  <iframe
                    src={`${getPreviewUrl()}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0"
                    title={`Preview - Page ${currentPage}`}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-white rounded-b-xl">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <IoChevronBack size={20} />
              Trang trước
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-600">
                Bạn đang xem trang {currentPage} / {maxPages}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tải xuống để xem toàn bộ sách
              </div>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= maxPages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Trang sau
              <IoChevronForward size={20} />
            </button>
          </div>

          {/* Warning Notice */}
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-200">
            <p className="text-xs text-amber-800 text-center">
              <span className="font-semibold">Lưu ý:</span> Bạn chỉ có thể xem trước 3 trang đầu tiên. 
              Tải xuống sách để đọc toàn bộ nội dung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

