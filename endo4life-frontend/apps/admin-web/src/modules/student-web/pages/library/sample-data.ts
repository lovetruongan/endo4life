import { Book } from './components/BookCard';

/**
 * Dữ liệu mẫu để test giao diện
 * Có thể xóa file này khi đã tích hợp API thật
 */
export const SAMPLE_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Giải phẫu học Gray - Phiên bản thứ 42',
    author: 'Susan Standring',
    category: 'anatomy',
    description: 'Cuốn sách giải phẫu học kinh điển và toàn diện nhất, được coi là kim chỉ nam cho sinh viên và bác sĩ trên toàn thế giới.',
    pages: 1584,
    publishYear: 2020,
    language: 'vi',
    views: 2543,
    downloads: 458,
  },
  {
    id: '2',
    title: 'Sinh lý học Y khoa Guyton và Hall',
    author: 'John E. Hall',
    category: 'physiology',
    description: 'Cuốn sách sinh lý học cơ bản và toàn diện, giải thích các cơ chế sinh lý của cơ thể con người một cách rõ ràng.',
    pages: 1145,
    publishYear: 2021,
    language: 'vi',
    views: 1987,
    downloads: 342,
  },
  {
    id: '3',
    title: 'Bệnh lý học Robbins',
    author: 'Vinay Kumar',
    category: 'pathology',
    description: 'Tài liệu bệnh lý học tiêu chuẩn, cung cấp kiến thức sâu sắc về các cơ chế bệnh sinh và biểu hiện bệnh lý.',
    pages: 1392,
    publishYear: 2019,
    language: 'vi',
    views: 1654,
    downloads: 289,
  },
  {
    id: '4',
    title: 'Dược lý học Cơ bản và Lâm sàng Katzung',
    author: 'Bertram G. Katzung',
    category: 'pharmacology',
    description: 'Cuốn sách dược lý toàn diện, kết hợp giữa dược lý học cơ bản và ứng dụng lâm sàng.',
    pages: 1248,
    publishYear: 2021,
    language: 'vi',
    views: 2103,
    downloads: 397,
  },
  {
    id: '5',
    title: 'Atlas Nội soi Tiêu hóa',
    author: 'Trần Văn Huy',
    category: 'endoscopy',
    description: 'Bộ ảnh atlas chi tiết về các thủ thuật và hình ảnh nội soi tiêu hóa, hữu ích cho bác sĩ thực hành.',
    pages: 456,
    publishYear: 2022,
    language: 'vi',
    views: 1234,
    downloads: 203,
  },
  {
    id: '6',
    title: 'Phẫu thuật Sabiston',
    author: 'Courtney M. Townsend',
    category: 'surgery',
    description: 'Tài liệu phẫu thuật toàn diện, bao gồm các kỹ thuật và nguyên tắc phẫu thuật hiện đại.',
    pages: 2208,
    publishYear: 2020,
    language: 'vi',
    views: 1876,
    downloads: 312,
  },
  {
    id: '7',
    title: 'Nội khoa Harrison - Tập 1',
    author: 'J. Larry Jameson',
    category: 'internal-medicine',
    description: 'Sách nội khoa nổi tiếng nhất thế giới, cung cấp kiến thức toàn diện về chẩn đoán và điều trị các bệnh nội khoa.',
    pages: 1567,
    publishYear: 2021,
    language: 'vi',
    views: 3210,
    downloads: 567,
  },
  {
    id: '8',
    title: 'Nhi khoa Nelson - Essentials',
    author: 'Karen J. Marcdante',
    category: 'pediatrics',
    description: 'Tài liệu nhi khoa thiết yếu, bao gồm các vấn đề thường gặp trong thực hành nhi khoa.',
    pages: 896,
    publishYear: 2022,
    language: 'vi',
    views: 1543,
    downloads: 278,
  },
  {
    id: '9',
    title: 'Sản phụ khoa Williams',
    author: 'F. Gary Cunningham',
    category: 'gynecology',
    description: 'Cuốn sách sản phụ khoa toàn diện và được cập nhật thường xuyên nhất.',
    pages: 1344,
    publishYear: 2020,
    language: 'vi',
    views: 1789,
    downloads: 301,
  },
  {
    id: '10',
    title: 'Bệnh học Tim mạch Braunwald',
    author: 'Douglas L. Mann',
    category: 'cardiology',
    description: 'Tài liệu tim mạch tiêu chuẩn, bao gồm tất cả các khía cạnh của bệnh học tim mạch.',
    pages: 1952,
    publishYear: 2021,
    language: 'vi',
    views: 1432,
    downloads: 245,
  },
  {
    id: '11',
    title: 'Thần kinh học Adams và Victor',
    author: 'Allan H. Ropper',
    category: 'neurology',
    description: 'Cuốn sách thần kinh học lâm sàng được đánh giá cao, bao gồm các nguyên tắc và thực hành lâm sàng.',
    pages: 1456,
    publishYear: 2019,
    language: 'vi',
    views: 1098,
    downloads: 187,
  },
  {
    id: '12',
    title: 'Kỹ thuật Nội soi Tiêu hóa',
    author: 'Nguyễn Văn An',
    category: 'endoscopy',
    description: 'Hướng dẫn chi tiết các kỹ thuật nội soi tiêu hóa từ cơ bản đến nâng cao.',
    pages: 523,
    publishYear: 2022,
    language: 'vi',
    views: 987,
    downloads: 156,
  },
];

/**
 * Function để filter và sort books (có thể dùng trong testing)
 */
export function filterAndSortBooks(
  books: Book[],
  search: string,
  category: string,
  sortBy: 'newest' | 'popular' | 'title'
): Book[] {
  let result = [...books];

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(
      (book) =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author?.toLowerCase().includes(searchLower) ||
        book.description?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by category
  if (category) {
    result = result.filter((book) => book.category === category);
  }

  // Sort
  switch (sortBy) {
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

