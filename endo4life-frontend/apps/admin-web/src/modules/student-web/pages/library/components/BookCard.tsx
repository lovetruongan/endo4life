import { Link } from 'react-router-dom';
import { IoBookOutline } from 'react-icons/io5';
import { AiOutlineEye } from 'react-icons/ai';

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
}

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Book Cover Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <IoBookOutline className="text-primary-300" size={80} />
          </div>
        )}
        
        {/* Category Badge */}
        {book.category && (
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-full">
              {book.category}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Link
            to={`/my-library/books/${book.id}`}
            className="px-6 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors min-h-[3.5rem]">
          {book.title}
        </h3>
        
        {book.author && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Tác giả:</span> {book.author}
          </p>
        )}

        {book.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {book.description}
          </p>
        )}

        {/* Book Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center gap-4">
            {book.pages && (
              <span>{book.pages} trang</span>
            )}
            {book.publishYear && (
              <span>Năm {book.publishYear}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          {book.views !== undefined && (
            <div className="flex items-center gap-1">
              <AiOutlineEye size={16} />
              <span>{book.views}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;

