import { IBookEntity } from '@endo4life/feature-book';
import { Book } from '../components/BookCard';

/**
 * Adapter để chuyển đổi IBookEntity từ backend sang Book interface của UI
 */
export function adaptBookEntityToBook(entity: IBookEntity): Book {
  // Map tags thành category (lấy tag đầu tiên làm category)
  const category = entity.tag && entity.tag.length > 0 ? entity.tag[0] : undefined;

  return {
    id: entity.id,
    title: entity.title,
    author: entity.author,
    category,
    description: entity.description,
    coverImageUrl: entity.thumbnailUrl,
    publishYear: entity.publishYear,
    fileUrl: entity.resourceUrl || entity.path,
    views: entity.viewNumber,
    pages: undefined, // Backend chưa có field này
    language: 'vi', // Default
  };
}

/**
 * Adapter cho danh sách books
 */
export function adaptBookEntitiesToBooks(entities: IBookEntity[]): Book[] {
  return entities.map(adaptBookEntityToBook);
}

