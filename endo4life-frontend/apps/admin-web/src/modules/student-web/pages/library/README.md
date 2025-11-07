# Library Page (Trang Thư Viện)

Trang thư viện hiển thị các sách y khoa cho học viên.

## 📁 Cấu trúc

```
library/
├── components/
│   ├── BookCard.tsx         # Component hiển thị từng cuốn sách
│   ├── BookList.tsx         # Component danh sách sách với grid layout
│   ├── BookFilters.tsx      # Component tìm kiếm và lọc sách
│   └── index.ts            # Export tập trung
├── page.tsx                 # Trang chính
├── layout.tsx              # Layout wrapper
├── loading.tsx             # Loading state
├── error.tsx               # Error state
└── README.md               # File này
```

## 🎨 Tính năng

### Hiện tại đã có:
- ✅ Hiển thị danh sách sách dạng grid responsive
- ✅ Tìm kiếm theo tên sách, tác giả
- ✅ Lọc theo danh mục (giải phẫu, sinh lý, bệnh lý, v.v.)
- ✅ Sắp xếp theo: mới nhất, phổ biến, tên A-Z
- ✅ Loading skeleton khi tải dữ liệu
- ✅ Empty state khi chưa có dữ liệu
- ✅ Card design đẹp với hover effects
- ✅ Stats hiển thị số lượng sách, danh mục, lượt xem
- ✅ Responsive design (mobile, tablet, desktop)

### Chưa tích hợp:
- ⏳ API để lấy dữ liệu sách từ backend
- ⏳ Chi tiết sách (trang `/my-library/books/:id`)
- ⏳ Tải xuống sách (download PDF)
- ⏳ Đánh dấu sách yêu thích
- ⏳ Lịch sử đọc sách

## 📦 Data Structure

Mỗi cuốn sách có cấu trúc như sau:

```typescript
interface Book {
  id: string;                  // ID duy nhất
  title: string;               // Tên sách
  author?: string;             // Tác giả
  category?: string;           // Danh mục (anatomy, physiology, v.v.)
  description?: string;        // Mô tả ngắn
  coverImageUrl?: string;      // URL ảnh bìa
  pages?: number;              // Số trang
  publishYear?: number;        // Năm xuất bản
  language?: string;           // Ngôn ngữ
  fileUrl?: string;            // URL file PDF
  views?: number;              // Lượt xem
  downloads?: number;          // Lượt tải
}
```

## 🔌 Tích hợp API (Hướng dẫn cho sau này)

### Bước 1: Tạo API hook

Tạo file `hooks/use-books.ts`:

```typescript
import { useQuery } from 'react-query';

export function useBooks(filters: BookFilterOptions) {
  const { data, loading, error } = useQuery(
    ['books', filters],
    async () => {
      // Call API here
      const response = await fetch('/api/books', {
        method: 'POST',
        body: JSON.stringify(filters),
      });
      return response.json();
    }
  );

  return { data, loading, error };
}
```

### Bước 2: Cập nhật LibraryPage

Trong file `page.tsx`, thay thế:

```typescript
// Thay đổi từ:
const SAMPLE_BOOKS: Book[] = [];
const [loading] = useState(false);

// Thành:
const { data: books, loading } = useBooks(filters);
```

### Bước 3: Thêm backend API

Backend cần tạo các endpoint:

- `GET /api/books` - Lấy danh sách sách
- `GET /api/books/:id` - Lấy chi tiết sách
- `POST /api/books/:id/view` - Tăng lượt xem
- `GET /api/books/:id/download` - Tải xuống sách

## 📂 Categories (Danh mục)

Các danh mục đã được định nghĩa:

- `anatomy` - Giải phẫu học
- `physiology` - Sinh lý học
- `pathology` - Bệnh lý học
- `pharmacology` - Dược lý học
- `surgery` - Phẫu thuật
- `internal-medicine` - Nội khoa
- `pediatrics` - Nhi khoa
- `gynecology` - Sản phụ khoa
- `cardiology` - Tim mạch
- `neurology` - Thần kinh
- `endoscopy` - Nội soi
- `others` - Khác

## 🎨 UI/UX Features

### Responsive Breakpoints:
- Mobile: 1 cột
- SM (640px+): 2 cột
- LG (1024px+): 3 cột
- XL (1280px+): 4 cột
- 2XL (1536px+): 5 cột

### Interactions:
- Hover effect trên card: shadow tăng, scale ảnh
- Click vào card: chuyển đến trang chi tiết
- Filter expandable: có thể ẩn/hiện bộ lọc
- Active filters: hiển thị các bộ lọc đang áp dụng

## 🌐 i18n

Tất cả text đã được chuẩn bị trong file:
`libs/feature-i18n/src/lib/vi/common.json` (section `library`)

## 📝 TODO

Khi có dữ liệu và API:

1. [ ] Tạo hook `use-books.ts` để gọi API
2. [ ] Tạo trang chi tiết sách `/books/[id]/page.tsx`
3. [ ] Thêm chức năng download sách
4. [ ] Thêm chức năng đánh dấu yêu thích
5. [ ] Thêm pagination khi có nhiều sách
6. [ ] Thêm recent books (sách đã xem gần đây)
7. [ ] Thêm recommended books (sách đề xuất)

## 🚀 Testing

Để test với dữ liệu mẫu, thêm vào `SAMPLE_BOOKS` trong `page.tsx`:

```typescript
const SAMPLE_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Giải phẫu học Gray',
    author: 'Henry Gray',
    category: 'anatomy',
    description: 'Cuốn sách giải phẫu học kinh điển...',
    coverImageUrl: 'https://example.com/gray-anatomy.jpg',
    pages: 1600,
    publishYear: 2020,
    language: 'vi',
    views: 1500,
    downloads: 250,
  },
  // ... thêm sách khác
];
```

