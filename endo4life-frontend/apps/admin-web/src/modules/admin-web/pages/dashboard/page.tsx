import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlinePhotograph,
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { useDashboardStats } from './hooks';
import {
  StatCard,
  QuickActions,
  ManagementCards,
  UserGrowthChart,
  ResourceViewsChart,
} from './components';

export default function DashboardPage() {
  const stats = useDashboardStats();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <HiOutlineChartBar size={28} className="text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Bảng điều khiển
          </h1>
        </div>
        <p className="text-gray-500">
          Chào mừng đến với trang quản trị Endo4Life
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tổng quan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<HiOutlineUsers size={24} />}
            label="Người dùng"
            value={stats.users}
            color="blue"
            loading={stats.loading}
          />
          <StatCard
            icon={<HiOutlineAcademicCap size={24} />}
            label="Khóa học"
            value={stats.courses}
            color="green"
            loading={stats.loading}
          />
          <StatCard
            icon={<HiOutlinePhotograph size={24} />}
            label="Hình ảnh"
            value={stats.images}
            color="purple"
            loading={stats.loading}
          />
          <StatCard
            icon={<HiOutlineVideoCamera size={24} />}
            label="Video"
            value={stats.videos}
            color="orange"
            loading={stats.loading}
          />
          <StatCard
            icon={<HiOutlineDocumentText size={24} />}
            label="Tài liệu"
            value={stats.documents}
            color="teal"
            loading={stats.loading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Charts Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Thống kê</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UserGrowthChart days={30} />
          <ResourceViewsChart limit={10} />
        </div>
      </div>

      {/* Management Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quản lý</h2>
        <ManagementCards stats={stats} />
      </div>
    </div>
  );
}
