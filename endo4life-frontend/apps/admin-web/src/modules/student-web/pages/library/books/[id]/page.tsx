import { useParams, useNavigate } from 'react-router-dom';
import { useBookDetail } from '../../hooks/use-books';
import { IoArrowBack, IoDownloadOutline, IoEyeOutline, IoCalendarOutline, IoDocumentTextOutline, IoCloseOutline } from 'react-icons/io5';
import { useState } from 'react';

export function BookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: book, loading, error } = useBookDetail(id || '');
    const [downloading, setDownloading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleDownload = async () => {
        if (!book?.fileUrl) return;

        try {
            setDownloading(true);
            const link = document.createElement('a');
            link.href = book.fileUrl;
            link.target = '_blank';
            link.download = book.title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h2>
                <p className="text-gray-600 mb-6">Cuốn sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <button
                    onClick={() => navigate('/my-library')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Quay lại thư viện
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/my-library')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 group"
                >
                    <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại thư viện</span>
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                        {/* Left Column - Cover Image */}
                        <div className="md:col-span-1">
                            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 shadow-md">
                                {book.coverImageUrl ? (
                                    <img
                                        src={book.coverImageUrl}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <IoDocumentTextOutline size={64} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                {book.category && (
                                    <span className="inline-block px-3 py-1 mb-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                                        {book.category}
                                    </span>
                                )}
                                <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                                    {book.title}
                                </h1>
                                {book.author && (
                                    <p className="text-lg text-gray-600">
                                        Tác giả: <span className="font-medium text-gray-900">{book.author}</span>
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu sách</h3>
                                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                                    {book.description || 'Chưa có mô tả cho cuốn sách này.'}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={() => setShowPreview(true)}
                                    disabled={!book.fileUrl}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <IoEyeOutline size={20} />
                                    <span>Xem trước</span>
                                </button>

                                <button
                                    onClick={handleDownload}
                                    disabled={!book.fileUrl || downloading}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <IoDownloadOutline size={20} />
                                    <span>{downloading ? 'Đang tải...' : 'Tải sách về'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Xem trước tài liệu</h3>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <IoCloseOutline size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 bg-gray-50 relative">
                            {book.fileUrl ? (
                                <iframe
                                    src={`${book.fileUrl}#page=1&view=FitH&toolbar=0`}
                                    className="w-full h-full"
                                    title="Book Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Không thể tải tài liệu xem trước
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookDetailPage;
