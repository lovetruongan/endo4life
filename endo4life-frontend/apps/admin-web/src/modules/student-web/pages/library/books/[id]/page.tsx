import { useParams, useNavigate } from 'react-router-dom';
import { useBookDetail } from '@endo4life/feature-book';
import { 
  IoArrowBack, 
  IoDownloadOutline, 
  IoEyeOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoBookOutline,
  IoShareSocialOutline
} from 'react-icons/io5';
import { MdBusinessCenter } from 'react-icons/md';

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { book, loading, error } = useBookDetail(id || '');

  if (loading) {
    return <BookDetailSkeleton />;
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy sách
          </h3>
          <p className="text-gray-600 mb-6">
            Sách bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate('/my-library')}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Quay lại Thư viện
          </button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (book.resourceUrl) {
      window.open(book.resourceUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/my-library')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <IoArrowBack size={20} />
            <span className="font-medium">Quay lại Thư viện</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Book Cover */}
                <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-50">
                  {book.thumbnailUrl ? (
                    <img
                      src={book.thumbnailUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <IoBookOutline className="text-primary-300" size={120} />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={!book.resourceUrl}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    <IoDownloadOutline size={20} />
                    Tải về
                  </button>

                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                  >
                    <IoShareSocialOutline size={20} />
                    Chia sẻ
                  </button>
                </div>

                {/* Stats */}
                <div className="border-t px-6 py-4">
                  <div className="flex items-center justify-center text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-900 font-bold text-lg">
                        <IoEyeOutline size={20} className="text-primary-600" />
                        {book.viewNumber || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Lượt xem</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {book.title}
              </h1>

              {/* Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
                {book.author && (
                  <div className="flex items-start gap-3">
                    <IoPersonOutline className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Tác giả</div>
                      <div className="font-semibold text-gray-900">{book.author}</div>
                    </div>
                  </div>
                )}

                {book.publisher && (
                  <div className="flex items-start gap-3">
                    <MdBusinessCenter className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Nhà xuất bản</div>
                      <div className="font-semibold text-gray-900">{book.publisher}</div>
                    </div>
                  </div>
                )}

                {book.publishYear && (
                  <div className="flex items-start gap-3">
                    <IoCalendarOutline className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Năm xuất bản</div>
                      <div className="font-semibold text-gray-900">{book.publishYear}</div>
                    </div>
                  </div>
                )}

                {book.isbn && (
                  <div className="flex items-start gap-3">
                    <IoBookOutline className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">ISBN</div>
                      <div className="font-semibold text-gray-900">{book.isbn}</div>
                    </div>
                  </div>
                )}

                {book.size && (
                  <div className="flex items-start gap-3">
                    <IoDownloadOutline className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Kích thước</div>
                      <div className="font-semibold text-gray-900">{book.size}</div>
                    </div>
                  </div>
                )}

                {book.extension && (
                  <div className="flex items-start gap-3">
                    <IoBookOutline className="text-primary-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Định dạng</div>
                      <div className="font-semibold text-gray-900 uppercase">{book.extension}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {((book.tag && book.tag.length > 0) || (book.detailTag && book.detailTag.length > 0)) && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {book.tag?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {book.detailTag?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Created By Info */}
              {book.createdByInfo && (
                <div className="mt-8 pt-6 border-t">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Người đóng góp</h2>
                  <div className="flex items-center gap-3">
                    {book.createdByInfo.avatar ? (
                      <img
                        src={book.createdByInfo.avatar}
                        alt={book.createdByInfo.fullName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <IoPersonOutline className="text-primary-600" size={24} />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {book.createdByInfo.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {book.createdByInfo.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6" />
              <div className="space-y-4 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;

