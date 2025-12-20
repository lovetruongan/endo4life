import { Link } from 'react-router-dom';
import { IoBookOutline } from 'react-icons/io5';

export interface Book {
  id: string;
  title: string;
  author?: string;
  category?: string;
  description?: string;
  coverImageUrl?: string;
  pages?: number;
  publishYear?: number;
  language?: string;
  fileUrl?: string;
  views?: number;
  downloads?: number;
}

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      to={`/my-library/books/${book.id}`}
      className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full"
    >
      {/* Book Cover Image */}
      <div className="relative aspect-[2/3] bg-gray-50 overflow-hidden">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <IoBookOutline size={48} className="mb-2" />
            <span className="text-xs font-medium">Không có ảnh bìa</span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Book Info */}
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-auto">
          {book.category && (
            <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
              {book.category}
            </span>
          )}

          <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors" title={book.title}>
            {book.title}
          </h3>

          {book.author && (
            <p className="text-sm text-gray-500 line-clamp-1 mb-2">
              {book.author}
            </p>
          )}

          {book.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 text-xs leading-relaxed">
              {book.description}
            </p>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-50 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {book.publishYear && (
              <span>{book.publishYear}</span>
            )}
            {book.pages && (
              <span>{book.pages} trang</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
