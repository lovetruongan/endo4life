import { useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { HiOutlineFilter } from 'react-icons/hi';

export interface BookFilterOptions {
  search: string;
  category: string;
  sortBy: 'newest' | 'popular' | 'title';
}

interface BookFiltersProps {
  onFilterChange: (filters: BookFilterOptions) => void;
}

// Danh sách các danh mục sách
const BOOK_CATEGORIES = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'anatomy', label: 'Giải phẫu học' },
  { value: 'physiology', label: 'Sinh lý học' },
  { value: 'pathology', label: 'Bệnh lý học' },
  { value: 'pharmacology', label: 'Dược lý học' },
  { value: 'surgery', label: 'Phẫu thuật' },
  { value: 'internal-medicine', label: 'Nội khoa' },
  { value: 'pediatrics', label: 'Nhi khoa' },
  { value: 'gynecology', label: 'Sản phụ khoa' },
  { value: 'cardiology', label: 'Tim mạch' },
  { value: 'neurology', label: 'Thần kinh' },
  { value: 'endoscopy', label: 'Nội soi' },
  { value: 'others', label: 'Khác' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'title', label: 'Theo tên A-Z' },
];

export function BookFilters({ onFilterChange }: BookFiltersProps) {
  const [filters, setFilters] = useState<BookFilterOptions>({
    search: '',
    category: '',
    sortBy: 'newest',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...filters, category: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: 'newest' | 'popular' | 'title') => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search and Filter Toggle */}
      <div className="flex gap-4 items-center">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <IoSearchOutline
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm sách theo tên, tác giả..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-3 border rounded-lg font-medium transition-colors ${
            showFilters
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <HiOutlineFilter size={20} />
          <span>Bộ lọc</span>
        </button>
      </div>

      {/* Filter Options - Expandable */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {BOOK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleSortChange(e.target.value as 'newest' | 'popular' | 'title')
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.category || filters.search) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
                {filters.category && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {BOOK_CATEGORIES.find((c) => c.value === filters.category)?.label}
                  </span>
                )}
                {filters.search && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    "{filters.search}"
                  </span>
                )}
                <button
                  onClick={() => {
                    const resetFilters = { search: '', category: '', sortBy: 'newest' as const };
                    setFilters(resetFilters);
                    onFilterChange(resetFilters);
                  }}
                  className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BookFilters;

