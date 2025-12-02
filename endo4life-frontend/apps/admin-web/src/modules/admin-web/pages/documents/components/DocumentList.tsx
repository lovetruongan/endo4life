import { BookDto } from '../../../../student-web/pages/library/api/book-api';
import { IoPencil, IoTrash, IoDocumentTextOutline } from 'react-icons/io5';

interface DocumentListProps {
    documents: BookDto[];
    onEdit: (doc: BookDto) => void;
    onDelete: (doc: BookDto) => void;
    isLoading?: boolean;
}

export function DocumentList({ documents, onEdit, onDelete, isLoading }: DocumentListProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Đang tải danh sách...</p>
            </div>
        );
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                    <IoDocumentTextOutline className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có tài liệu nào</h3>
                <p className="text-gray-500">Hãy thêm tài liệu mới để bắt đầu quản lý</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 font-semibold text-gray-700 w-20">Ảnh bìa</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tên tài liệu</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tác giả</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {documents.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden shadow-sm">
                                        {doc.coverUrl ? (
                                            <img src={doc.coverUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <IoDocumentTextOutline size={20} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{doc.title}</div>
                                    {doc.description && (
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{doc.description}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {doc.author || '---'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(doc)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <IoPencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(doc)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <IoTrash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
