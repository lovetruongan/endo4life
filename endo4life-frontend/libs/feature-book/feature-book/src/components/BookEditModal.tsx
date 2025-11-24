import { useState, useEffect } from 'react';
import { 
  IoCloseOutline, 
  IoImageOutline,
  IoCheckmarkCircle 
} from 'react-icons/io5';
import { IBookEntity, IUpdateBookRequest, ResourceState } from '../types';

interface BookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: IBookEntity | null;
  onSubmit: (id: string, request: IUpdateBookRequest) => Promise<void>;
}

export function BookEditModal({ isOpen, onClose, book, onSubmit }: BookEditModalProps) {
  const [formData, setFormData] = useState<Partial<IUpdateBookRequest>>({
    title: '',
    description: '',
    state: ResourceState.PUBLIC,
    author: '',
    publisher: '',
    publishYear: new Date().getFullYear(),
    isbn: '',
    tag: [],
    detailTag: []
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [detailTagInput, setDetailTagInput] = useState('');

  // Load book data when modal opens
  useEffect(() => {
    if (isOpen && book) {
      setFormData({
        title: book.title || '',
        description: book.description || '',
        state: book.state || ResourceState.PUBLIC,
        author: book.author || '',
        publisher: book.publisher || '',
        publishYear: book.publishYear || new Date().getFullYear(),
        isbn: book.isbn || '',
        tag: book.tag || [],
        detailTag: book.detailTag || []
      });
      setThumbnailPreview(book.thumbnailUrl || null);
      setThumbnailFile(null);
      setError(null);
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Create preview for image
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tag?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tag: [...(formData.tag || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tag: formData.tag?.filter(t => t !== tag)
    });
  };

  const handleAddDetailTag = () => {
    if (detailTagInput.trim() && !formData.detailTag?.includes(detailTagInput.trim())) {
      setFormData({
        ...formData,
        detailTag: [...(formData.detailTag || []), detailTagInput.trim()]
      });
      setDetailTagInput('');
    }
  };

  const handleRemoveDetailTag = (tag: string) => {
    setFormData({
      ...formData,
      detailTag: formData.detailTag?.filter(t => t !== tag)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title?.trim()) {
      setError('Vui lòng nhập tên sách');
      return;
    }

    setUpdating(true);

    try {
      const request: IUpdateBookRequest = {
        title: formData.title,
        description: formData.description,
        state: formData.state,
        tag: formData.tag,
        detailTag: formData.detailTag,
        author: formData.author,
        publisher: formData.publisher,
        publishYear: formData.publishYear,
        isbn: formData.isbn
      };

      await onSubmit(book.id, request);
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật sách');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!updating ? onClose : undefined}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Chỉnh sửa Sách</h2>
            </div>
            {!updating && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <IoCloseOutline size={24} />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Thumbnail */}
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ảnh Bìa Sách
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      disabled={updating}
                      className="hidden"
                      id="thumbnail-input-edit"
                    />
                    <label
                      htmlFor="thumbnail-input-edit"
                      className={`flex items-center justify-center gap-3 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        updating
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                          : 'border-primary-300 bg-primary-50 hover:border-primary-500 hover:bg-primary-100'
                      }`}
                    >
                      {thumbnailPreview ? (
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="max-h-40 rounded"
                        />
                      ) : (
                        <>
                          <IoImageOutline 
                            size={32} 
                            className={updating ? 'text-gray-400' : 'text-primary-600'} 
                          />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                              Click để chọn ảnh bìa mới
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, WebP (Khuyến nghị: 400x600px)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Lưu ý: Thay đổi ảnh bìa sẽ cần upload lại file mới
                  </p>
                </div>
              </div>

              {/* Right Column - Book Information */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên Sách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={updating}
                    placeholder="VD: Giải phẫu học nội tạng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tác Giả
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    disabled={updating}
                    placeholder="VD: GS. TS. Nguyễn Văn A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nhà Xuất Bản
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    disabled={updating}
                    placeholder="VD: Nhà xuất bản Y học"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Publish Year & ISBN */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Năm Xuất Bản
                    </label>
                    <input
                      type="number"
                      value={formData.publishYear}
                      onChange={(e) => setFormData({ ...formData, publishYear: parseInt(e.target.value) })}
                      disabled={updating}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      disabled={updating}
                      placeholder="978-xxx-xxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng Thái
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value as ResourceState })}
                    disabled={updating}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value={ResourceState.PUBLIC}>Công khai</option>
                    <option value={ResourceState.PRIVATE}>Riêng tư</option>
                    <option value={ResourceState.DRAFT}>Nháp</option>
                    <option value={ResourceState.UNLISTED}>Không liệt kê</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô Tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={updating}
                rows={4}
                placeholder="Nhập mô tả chi tiết về nội dung sách..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 resize-none"
              />
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  disabled={updating}
                  placeholder="Nhập tag và nhấn Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={updating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tag?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={updating}
                      className="hover:text-primary-900"
                    >
                      <IoCloseOutline size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Detail Tags */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags Chi Tiết
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={detailTagInput}
                  onChange={(e) => setDetailTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDetailTag())}
                  disabled={updating}
                  placeholder="Nhập tag chi tiết và nhấn Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={handleAddDetailTag}
                  disabled={updating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.detailTag?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveDetailTag(tag)}
                      disabled={updating}
                      className="hover:text-purple-900"
                    >
                      <IoCloseOutline size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={updating}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updating || !formData.title}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle size={20} />
                    Cập nhật
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

