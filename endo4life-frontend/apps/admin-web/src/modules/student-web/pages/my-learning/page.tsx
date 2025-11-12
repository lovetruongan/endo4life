import { useAuthContext } from '@endo4life/feature-auth';
import { useCourseProgress } from '@endo4life/feature-resources';
import { useNavigate } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { SmartCourseCard } from './components/SmartCourseCard';
import { useState, useMemo } from 'react';
import { MdSearch, MdFilterList, MdCheckCircle, MdPlayArrow, MdSchool } from 'react-icons/md';

type FilterType = 'all' | 'in-progress' | 'completed';

export function MyLearningPage() {
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const { data: courses, loading, error } = useCourseProgress(userInfoId);

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      // Search filter
      const matchesSearch = course.courseTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Status filter
      const progressPercentage =
        course.totalLectures > 0
          ? (course.numberLecturesCompleted / course.totalLectures) * 100
          : 0;

      let matchesFilter = true;
      if (filterType === 'completed') {
        matchesFilter = progressPercentage === 100;
      } else if (filterType === 'in-progress') {
        matchesFilter = progressPercentage > 0 && progressPercentage < 100;
      }

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, filterType]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!courses) return { total: 0, inProgress: 0, completed: 0 };

    return courses.reduce(
      (acc, course) => {
        const progressPercentage =
          course.totalLectures > 0
            ? (course.numberLecturesCompleted / course.totalLectures) * 100
            : 0;

        acc.total += 1;
        if (progressPercentage === 100) {
          acc.completed += 1;
        } else if (progressPercentage > 0) {
          acc.inProgress += 1;
        }
        return acc;
      },
      { total: 0, inProgress: 0, completed: 0 }
    );
  }, [courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Đang tải khóa học của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Không thể tải khóa học</p>
          <p className="text-gray-600">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có khóa học nào
          </h2>
          <p className="text-gray-600 mb-6">
            Bắt đầu hành trình học tập bằng cách đăng ký khóa học từ thư viện của chúng tôi
          </p>
          <button
            onClick={() => navigate(STUDENT_WEB_ROUTES.RESOURCES)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Khám phá khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Khóa học của tôi
          </h1>
          <p className="text-gray-600 text-lg">
            Theo dõi tiến độ và tiếp tục hành trình học tập của bạn
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Tổng khóa học</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <MdSchool className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Đang học</p>
                <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <MdPlayArrow className="text-orange-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <MdCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <MdFilterList className="text-gray-500 text-xl" />
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('in-progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'in-progress'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đang học
              </button>
              <button
                onClick={() => setFilterType('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hoàn thành
              </button>
            </div>
          </div>
        </div>

        {/* Course Results Info */}
        {searchQuery && (
          <div className="mb-4 text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{filteredCourses.length}</span> kết quả
            {searchQuery && ` cho "${searchQuery}"`}
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <SmartCourseCard
                key={course.id}
                course={course}
                userInfoId={userInfoId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-4">
              <MdSearch className="mx-auto text-gray-300 text-6xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy khóa học nào
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? `Không có khóa học nào phù hợp với "${searchQuery}"`
                : 'Thử thay đổi bộ lọc để xem các khóa học khác'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLearningPage;
