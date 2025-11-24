import { IoBookOutline, IoEyeOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import { IBookEntity } from '@endo4life/feature-book';

interface BookCardAdminProps {
  book: IBookEntity;
  onView: (book: IBookEntity) => void;
  onEdit: (book: IBookEntity) => void;
  onDelete: (book: IBookEntity) => void;
}

export function BookCardAdmin({ book, onView, onEdit, onDelete }: BookCardAdminProps) {
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Book Cover Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
        {book.thumbnailUrl ? (
          <img
            src={book.thumbnailUrl}
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
        
        {/* State Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${
            book.state === 'PUBLIC' ? 'bg-green-600' :
            book.state === 'PRIVATE' ? 'bg-red-600' :
            book.state === 'DRAFT' ? 'bg-yellow-600' :
            'bg-gray-600'
          }`}>
            {book.state}
          </span>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onView(book)}
            className="p-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            title="Xem chi tiết"
          >
            <IoEyeOutline size={20} />
          </button>
          <button
            onClick={() => onEdit(book)}
            className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Chỉnh sửa"
          >
            <IoPencilOutline size={20} />
          </button>
          <button
            onClick={() => onDelete(book)}
            className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Xóa"
          >
            <IoTrashOutline size={20} />
          </button>
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
            {book.publishYear && (
              <span>Năm {book.publishYear}</span>
            )}
            {book.publisher && (
              <span className="line-clamp-1">{book.publisher}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <IoEyeOutline size={16} />
            <span>{book.viewNumber || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {book.tag && book.tag.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {book.tag.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {book.tag.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{book.tag.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

