import { useQuery } from 'react-query';
import { Book } from '../components/BookCard';
import { BookFilterOptions } from '../components/BookFilters';
import { bookApi, BookDto } from '../api/book-api';

const REACT_QUERY_KEY = 'LIBRARY_BOOKS';

/**
 * Convert BookDto from API to Book interface for UI
 */
function mapBookDtoToBook(dto: BookDto): Book {
  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    description: dto.description,
    coverImageUrl: dto.coverUrl,
    fileUrl: dto.fileUrl,
    // Backend doesn't provide these fields yet, so we set defaults
    category: undefined,
    pages: undefined,
    publishYear: undefined,
    language: 'vi',
    views: undefined,
    downloads: undefined,
  };
}

/**
 * Hook để lấy danh sách sách từ API
 */
export function useBooks(filters: BookFilterOptions) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, filters],
    async () => {
      const books = await bookApi.getBooks();
      return books.map(mapBookDtoToBook);
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Apply client-side filtering
  const filteredData = applyFilters(data || [], filters);

  return {
    data: filteredData,
    loading: isLoading,
    error,
    refetch,
  };
}

/**
 * Apply filters to the book list
 */
function applyFilters(books: Book[], filters: BookFilterOptions): Book[] {
  let result = [...books];

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (book) =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author?.toLowerCase().includes(searchLower) ||
        book.description?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by category
  if (filters.category) {
    result = result.filter((book) => book.category === filters.category);
  }

  // Sort
  switch (filters.sortBy) {
    case 'newest':
      result.sort((a, b) => (b.publishYear || 0) - (a.publishYear || 0));
      break;
    case 'popular':
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
      break;
  }

  return result;
}

/**
 * Hook để lấy chi tiết một cuốn sách
 */
export function useBookDetail(bookId: string) {
  const { data, error, isLoading, refetch } = useQuery(
    [REACT_QUERY_KEY, 'detail', bookId],
    async () => {
      const book = await bookApi.getBookById(bookId);
      return book ? mapBookDtoToBook(book) : null;
    },
    {
      enabled: !!bookId,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
}

/**
 * Hook để tăng view count khi xem sách
 * TODO: Implement khi có backend API
 */
export function useRecordBookView() {
  return {
    recordView: async (bookId: string) => {
      // TODO: Replace with actual API call
      // const api = new LibraryApiImpl();
      // return api.recordBookView(bookId);
      console.log('Record view for book:', bookId);
    },
  };
}
