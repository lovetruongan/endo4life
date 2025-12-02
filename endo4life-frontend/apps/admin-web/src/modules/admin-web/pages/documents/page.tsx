import { useState, useEffect } from 'react';
import { IoAdd } from 'react-icons/io5';
import { bookApi, BookDto } from '../../../student-web/pages/library/api/book-api';
import { DocumentList } from './components/DocumentList';
import { DocumentForm } from './components/DocumentForm';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<BookDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<BookDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await bookApi.getBooks();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAdd = () => {
    setEditingDoc(null);
    setIsFormOpen(true);
  };

  const handleEdit = (doc: BookDto) => {
    setEditingDoc(doc);
    setIsFormOpen(true);
  };

  const handleDelete = async (doc: BookDto) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${doc.title}" không?`)) {
      return;
    }

    try {
      await bookApi.deleteBook(doc.id);
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Có lỗi xảy ra khi xóa tài liệu');
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      const title = formData.get('title') as string;
      const author = formData.get('author') as string;
      const description = formData.get('description') as string;
      const file = formData.get('file') as File;
      const cover = formData.get('cover') as File;

      if (editingDoc) {
        await bookApi.updateBook(editingDoc.id, title, author, description, file, cover);
      } else {
        await bookApi.createBook(title, author, description, file, cover);
      }

      await fetchDocuments();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Có lỗi xảy ra khi lưu tài liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài liệu</h1>
          <p className="text-gray-500 mt-1">Quản lý sách và tài liệu đóng góp</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <IoAdd size={20} />
          <span>Thêm tài liệu</span>
        </button>
      </div>

      {/* List */}
      <DocumentList
        documents={documents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Form Modal */}
      {isFormOpen && (
        <DocumentForm
          initialData={editingDoc}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
