import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { HiOutlineTrendingUp } from 'react-icons/hi';
import { useUserGrowthStats } from '../hooks';

interface UserGrowthChartProps {
  days?: number;
}

export function UserGrowthChart({ days = 30 }: UserGrowthChartProps) {
  const { data, loading } = useUserGrowthStats(days);

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    }),
    'Người dùng mới': item.count,
    'Tổng cộng': item.cumulativeCount,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineTrendingUp size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Tăng trưởng người dùng
        </h3>
        <span className="text-sm text-gray-500">({days} ngày gần nhất)</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Người dùng mới"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Tổng cộng"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserGrowthChart;
