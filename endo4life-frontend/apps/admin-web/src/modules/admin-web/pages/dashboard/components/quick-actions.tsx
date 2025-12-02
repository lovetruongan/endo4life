import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { VscAdd } from 'react-icons/vsc';
import { HiOutlineUserAdd, HiOutlineBookOpen, HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineDocumentAdd } from 'react-icons/hi';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg 
                 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                 text-sm font-medium text-gray-700 shadow-sm"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <HiOutlineUserAdd size={18} />,
      label: 'Thêm người dùng',
      route: ADMIN_WEB_ROUTES.USER_CREATE,
    },
    {
      icon: <HiOutlineBookOpen size={18} />,
      label: 'Tạo khóa học',
      route: ADMIN_WEB_ROUTES.COURSE_CREATE,
    },
    {
      icon: <HiOutlinePhotograph size={18} />,
      label: 'Tải hình ảnh',
      route: ADMIN_WEB_ROUTES.IMAGE_CREATE,
    },
    {
      icon: <HiOutlineVideoCamera size={18} />,
      label: 'Tải video',
      route: ADMIN_WEB_ROUTES.VIDEO_CREATE,
    },
    {
      icon: <HiOutlineDocumentAdd size={18} />,
      label: 'Thêm tài liệu',
      route: ADMIN_WEB_ROUTES.DOCUMENTS,
    },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <VscAdd size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Thao tác nhanh</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <QuickActionButton
            key={action.route}
            icon={action.icon}
            label={action.label}
            onClick={() => navigate(action.route)}
          />
        ))}
      </div>
    </div>
  );
}

export default QuickActions;

