# @endo4life/feature-book

Feature module for managing books in the Endo4Life application.

## Features

- 📚 Browse books with pagination and filtering
- 📖 View book details
- 🔍 Search books by title, author, publisher
- 🏷️ Filter by tags and categories
- ⬇️ Download books

## Components

### BookList
Display a paginated list of books with filtering capabilities.

```tsx
import { BookList } from '@endo4life/feature-book';

function MyComponent() {
  return (
    <BookList 
      filter={{ page: 0, size: 20 }}
      onBookClick={(book) => console.log(book)}
    />
  );
}
```

### BookDetail
Display detailed information about a specific book.

```tsx
import { BookDetail } from '@endo4life/feature-book';

function MyComponent() {
  return (
    <BookDetail 
      bookId="book-uuid"
      onDownload={(id, path) => console.log('Download:', id, path)}
    />
  );
}
```

### BookCard
Display a single book as a card.

```tsx
import { BookCard } from '@endo4life/feature-book';

function MyComponent() {
  return (
    <BookCard 
      book={bookData}
      onClick={(book) => console.log(book)}
    />
  );
}
```

## Hooks

### useBooks
Hook for fetching and managing a list of books.

```tsx
import { useBooks } from '@endo4life/feature-book';

function MyComponent() {
  const { books, loading, error, totalCount, updateFilter, refetch } = useBooks({
    page: 0,
    size: 20
  });

  return (
    <div>
      {books.map(book => <div key={book.id}>{book.title}</div>)}
    </div>
  );
}
```

### useBookDetail
Hook for fetching book details.

```tsx
import { useBookDetail } from '@endo4life/feature-book';

function MyComponent({ bookId }: { bookId: string }) {
  const { book, loading, error, refetch } = useBookDetail(bookId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{book?.title}</div>;
}
```

## API

### bookApi
API service for book operations.

```tsx
import { bookApi } from '@endo4life/feature-book';

// Get books
const booksResponse = await bookApi.getBooks({
  page: 0,
  size: 20,
  title: 'search term'
});

// Get book by ID
const bookResponse = await bookApi.getBookById('book-uuid');

// Create book
const createResponse = await bookApi.createBook({
  title: 'Book Title',
  description: 'Description',
  author: 'Author Name',
  publisher: 'Publisher',
  publishYear: 2025,
  isbn: '123-456-789',
  state: 'PUBLIC',
  file: fileObject
});

// Update book
await bookApi.updateBook('book-uuid', {
  title: 'Updated Title'
});

// Delete book
await bookApi.deleteBook('book-uuid');
```

## Types

### IBookEntity
Main book entity interface.

```typescript
interface IBookEntity {
  id: string;
  title: string;
  description?: string;
  path: string;
  thumbnailUrl?: string;
  resourceUrl?: string;
  type: ResourceType;
  state: ResourceState;
  extension?: string;
  size?: string;
  viewNumber: number;
  commentCount: number;
  createdBy: string;
  createdAt: string;
  // Book-specific fields
  author?: string;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
}
```

### IBookFilter
Filter options for querying books.

```typescript
interface IBookFilter {
  title?: string;
  state?: ResourceState;
  createdBy?: string;
  tag?: string[];
  author?: string;
  publisher?: string;
  publishYear?: number;
  page?: number;
  size?: number;
  sort?: string;
}
```

## Installation

This module is part of the Endo4Life monorepo and is automatically available.

## Dependencies

- `@endo4life/data-access` - For API communication
- `@endo4life/feature-config` - For configuration
- `@endo4life/types` - For shared types
- React 18+

## Development

```bash
# Run tests
nx test feature-book-feature-book

# Lint
nx lint feature-book-feature-book

# Build
nx build feature-book-feature-book
```
