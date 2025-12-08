import { useAuthContext } from '@endo4life/feature-auth';
import { MdBlock } from 'react-icons/md';
import {
  LOCALE_STORAGE_KEYS,
  WEB_CLIENT_STUDENT,
} from '@endo4life/feature-config';

export default function UnauthorizedPage() {
  const { userProfile, logout } = useAuthContext();

  const handleGoToStudentUI = () => {
    // Switch to student web client and reload
    localStorage.setItem(LOCALE_STORAGE_KEYS.WEB_CLIENT_ID, WEB_CLIENT_STUDENT);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <MdBlock className="mx-auto text-red-500" size={80} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-6">
          Tài khoản của bạn ({userProfile?.email}) không có quyền truy cập trang
          quản trị.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoToStudentUI}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Về trang người dùng
          </button>
          <button
            onClick={() => logout?.()}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

