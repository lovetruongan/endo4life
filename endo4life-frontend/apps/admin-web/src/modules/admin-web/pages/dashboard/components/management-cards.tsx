import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlinePhotograph,
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineChatAlt2,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';
import clsx from 'clsx';

interface ManagementCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  route: string;
  color: string;
}

function ManagementCard({
  icon,
  title,
  description,
  count,
  route,
  color,
}: ManagementCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(route)}
      className={clsx(
        'bg-white rounded-xl p-5 shadow-sm border-2 border-transparent cursor-pointer',
        'transition-all duration-200 hover:shadow-md',
        `hover:border-${color}-300`,
      )}
      style={{ borderColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `var(--${color}-color, #e5e7eb)`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
        {count !== undefined && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
            {count.toLocaleString()}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

interface ManagementCardsProps {
  stats: {
    users: number;
    images: number;
    videos: number;
    courses: number;
    documents: number;
  };
}

export function ManagementCards({ stats }: ManagementCardsProps) {
  const cards = [
    {
      icon: <HiOutlineUsers size={24} />,
      title: 'Người dùng',
      description: 'Quản lý người dùng và phân quyền',
      count: stats.users,
      route: ADMIN_WEB_ROUTES.USERS,
      color: 'blue',
    },
    {
      icon: <HiOutlineAcademicCap size={24} />,
      title: 'Khóa học',
      description: 'Quản lý các khóa học đào tạo',
      count: stats.courses,
      route: ADMIN_WEB_ROUTES.COURSES,
      color: 'green',
    },
    {
      icon: <HiOutlinePhotograph size={24} />,
      title: 'Hình ảnh',
      description: 'Quản lý hình ảnh y khoa',
      count: stats.images,
      route: ADMIN_WEB_ROUTES.IMAGES,
      color: 'purple',
    },
    {
      icon: <HiOutlineVideoCamera size={24} />,
      title: 'Video',
      description: 'Quản lý video đào tạo',
      count: stats.videos,
      route: ADMIN_WEB_ROUTES.VIDEOS,
      color: 'orange',
    },
    {
      icon: <HiOutlineDocumentText size={24} />,
      title: 'Tài liệu',
      description: 'Quản lý sách và tài liệu',
      count: stats.documents,
      route: ADMIN_WEB_ROUTES.DOCUMENTS,
      color: 'teal',
    },
    {
      icon: <HiOutlineTag size={24} />,
      title: 'Thẻ tag',
      description: 'Quản lý thẻ phân loại',
      route: ADMIN_WEB_ROUTES.TAGS,
      color: 'pink',
    },
    {
      icon: <HiOutlineChatAlt2 size={24} />,
      title: 'Bình luận',
      description: 'Kiểm duyệt bình luận',
      route: ADMIN_WEB_ROUTES.COMMENTS,
      color: 'indigo',
    },
    {
      icon: <HiOutlineQuestionMarkCircle size={24} />,
      title: 'Hỏi đáp',
      description: 'Quản lý câu hỏi thảo luận',
      route: ADMIN_WEB_ROUTES.QUESTIONS,
      color: 'cyan',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <ManagementCard key={card.route} {...card} />
      ))}
    </div>
  );
}

export default ManagementCards;

