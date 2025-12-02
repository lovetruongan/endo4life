import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-600',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-600',
    text: 'text-teal-600',
  },
};

export function StatCard({ icon, label, value, color, loading }: StatCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-16 mb-1" />
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02] cursor-pointer',
        colors.bg,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={clsx('p-3 rounded-lg', colors.icon)}>{icon}</div>
        <div>
          <p className={clsx('text-2xl font-bold', colors.text)}>
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default StatCard;

