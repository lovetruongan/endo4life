import { useState, useEffect } from 'react';
import { IoCloudUploadOutline, IoCloseOutline } from 'react-icons/io5';
import { BookDto } from '../../../../student-web/pages/library/api/book-api';

interface DocumentFormProps {
    initialData?: BookDto | null;
    onSubmit: (data: FormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function DocumentForm({ initialData, onSubmit, onCancel, isLoading }: DocumentFormProps) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setAuthor(initialData.author || '');
            setDescription(initialData.description || '');
            // Files cannot be set from URL easily, so we leave them empty for update unless changed
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!title) return;
        if (!initialData && !file) {
            alert('Vui lòng chọn file tài liệu');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);
        if (file) formData.append('file', file);
        if (cover) formData.append('cover', cover);

        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Cập nhật tài liệu' : 'Upload tài liệu mới'}
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <IoCloseOutline size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên tài liệu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Nhập tên sách/tài liệu"
                            required
                        />
                    </div>

                    {/* Author */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tác giả
                        </label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Nhập tên tác giả"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            placeholder="Nhập mô tả về tài liệu..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                File tài liệu (PDF) {initialData ? '(Để trống nếu không đổi)' : <span className="text-red-500">*</span>}
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <IoCloudUploadOutline className="text-gray-400 mb-2" size={24} />
                                    <span className="text-sm text-gray-600">
                                        {file ? file.name : 'Chọn file PDF'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cover Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ảnh bìa {initialData && '(Để trống nếu không đổi)'}
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCover(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <IoCloudUploadOutline className="text-gray-400 mb-2" size={24} />
                                    <span className="text-sm text-gray-600">
                                        {cover ? cover.name : 'Chọn ảnh bìa'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                            {initialData ? 'Lưu thay đổi' : 'Upload tài liệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
