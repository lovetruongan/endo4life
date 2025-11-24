import React from 'react';
import { IBookEntity } from '../types';

interface BookCardProps {
  book: IBookEntity;
  onClick?: (book: IBookEntity) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  return (
    <div 
      onClick={() => onClick?.(book)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
        {book.thumbnailUrl ? (
          <img 
            src={book.thumbnailUrl} 
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
        {book.title}
      </h3>

      {/* Author & Publisher */}
      {(book.author || book.publisher) && (
        <div className="text-sm text-gray-600 mb-2">
          {book.author && <div>Tác giả: {book.author}</div>}
          {book.publisher && <div>NXB: {book.publisher}</div>}
          {book.publishYear && <div>Năm: {book.publishYear}</div>}
        </div>
      )}

      {/* Description */}
      {book.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {book.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>👁 {book.viewNumber}</span>
          <span>💬 {book.commentCount}</span>
        </div>
        {book.extension && (
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
            {book.extension.toUpperCase()}
          </span>
        )}
      </div>

      {/* Author Info */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {book.createdByInfo?.avatar ? (
            <img 
              src={book.createdByInfo.avatar} 
              alt={book.createdByInfo.fullName}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
          )}
          <span className="text-sm text-gray-600">
            {book.createdByInfo?.fullName ?? book.createdBy}
          </span>
        </div>
      </div>

      {/* Tags */}
      {book.tag && book.tag.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {book.tag.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {book.tag.length > 3 && (
            <span className="text-xs text-gray-400">+{book.tag.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};

