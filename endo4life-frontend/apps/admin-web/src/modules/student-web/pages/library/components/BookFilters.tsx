import { useState, useEffect } from 'react';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';

export interface BookFilterOptions {
  search: string;
  category: string;
  sortBy: 'newest' | 'popular' | 'title';
}

interface BookFiltersProps {
  onFilterChange: (filters: BookFilterOptions) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'title', label: 'Tên A-Z' },
];

export function BookFilters({ onFilterChange }: BookFiltersProps) {
  const [filters, setFilters] = useState<BookFilterOptions>({
    search: '',
    category: '',
    sortBy: 'newest',
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Immediate update for other filters
  const handleFilterUpdate = (newFilters: BookFilterOptions) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative group">
          <IoSearchOutline
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg outline-none transition-all text-sm"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <IoCloseOutline size={18} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex gap-3">
          {/* Sort Select */}
          <div className="relative min-w-[160px]">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterUpdate({ ...filters, sortBy: e.target.value as any })}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookFilters;
