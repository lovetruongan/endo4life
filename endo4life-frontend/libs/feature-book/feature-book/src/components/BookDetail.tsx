import React from 'react';
import { useBookDetail } from '../hooks/useBookDetail';

interface BookDetailProps {
  bookId: string;
  onDownload?: (bookId: string, path: string) => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ bookId, onDownload }) => {
  const { book, loading, error } = useBookDetail(bookId);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-red-500 p-4">
        Không tìm thấy sách
      </div>
    );
  }

  const handleDownload = () => {
    if (onDownload && book.path) {
      onDownload(book.id, book.path);
    } else if (book.resourceUrl) {
      window.open(book.resourceUrl, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Thumbnail */}
          <div className="w-full md:w-64 h-96 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {book.thumbnailUrl ? (
              <img 
                src={book.thumbnailUrl} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
            
            {/* Book Info */}
            {(book.author || book.publisher || book.publishYear || book.isbn) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                {book.author && (
                  <div className="mb-2">
                    <span className="font-medium">Tác giả:</span> {book.author}
                  </div>
                )}
                {book.publisher && (
                  <div className="mb-2">
                    <span className="font-medium">Nhà xuất bản:</span> {book.publisher}
                  </div>
                )}
                {book.publishYear && (
                  <div className="mb-2">
                    <span className="font-medium">Năm xuất bản:</span> {book.publishYear}
                  </div>
                )}
                {book.isbn && (
                  <div>
                    <span className="font-medium">ISBN:</span> {book.isbn}
                  </div>
                )}
              </div>
            )}
            
            {/* Metadata */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-4 text-gray-600">
                <span>👁 {book.viewNumber} lượt xem</span>
                <span>💬 {book.commentCount} bình luận</span>
                {book.size && <span>📦 {book.size}</span>}
                {book.extension && (
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {book.extension.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {book.createdByInfo?.avatar ? (
                  <img 
                    src={book.createdByInfo.avatar} 
                    alt={book.createdByInfo.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                )}
                <div>
                  <div className="font-medium">
                    {book.createdByInfo?.fullName ?? book.createdBy}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(book.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {book.tag && book.tag.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {book.tag.map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Tải xuống
            </button>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {book.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

