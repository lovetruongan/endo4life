import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { HiOutlineEye } from 'react-icons/hi';
import { useResourceViewsStats } from '../hooks';

interface ResourceViewsChartProps {
  limit?: number;
}

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#f59e0b',
  '#84cc16',
  '#ef4444',
];

export function ResourceViewsChart({ limit = 10 }: ResourceViewsChartProps) {
  const { data, loading } = useResourceViewsStats(limit);

  // Format data for chart
  const chartData = data.map((item) => ({
    name:
      item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
    fullName: item.title,
    'Lượt xem': item.viewCount,
    type: item.type === 'IMAGE' ? 'Hình ảnh' : 'Video',
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

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineEye size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Tài nguyên được xem nhiều nhất
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chưa có dữ liệu
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineEye size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Tài nguyên được xem nhiều nhất
        </h3>
        <span className="text-sm text-gray-500">(Top {limit})</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              horizontal={false}
            />
            <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value.toLocaleString()} lượt xem`,
                props.payload.fullName,
              ]}
              labelFormatter={() => ''}
            />
            <Bar dataKey="Lượt xem" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ResourceViewsChart;
