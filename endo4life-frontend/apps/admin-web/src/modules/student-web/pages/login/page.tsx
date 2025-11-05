import { useState } from 'react';
import axios from 'axios';
import { EnvConfig } from '@endo4life/feature-config';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdError,
} from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

// Authentication storage keys
const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'endo4life_access_token',
  REFRESH_TOKEN: 'endo4life_refresh_token',
  TOKEN_EXPIRY: 'endo4life_token_expiry',
  USER_PROFILE: 'endo4life_user_profile',
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get the redirect path from state or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  const saveTokensToStorage = (
    token: string,
    refreshToken: string,
    expiresIn?: number,
  ) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(
        AUTH_STORAGE_KEYS.TOKEN_EXPIRY,
        expiryTime.toString(),
      );
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', EnvConfig.Endo4LifeClient);
      params.append('client_secret', EnvConfig.Endo4LifeClientSecret);
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(
        `${EnvConfig.Endo4LifeUrl}/realms/${EnvConfig.Endo4LifeRealm}/protocol/openid-connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (response.data.access_token && response.data.refresh_token) {
        // Save tokens to localStorage first
        saveTokensToStorage(
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in,
        );

        // Fetch user info from backend to get the database user_info.id
        try {
          const userInfoResponse = await fetch(
            `${import.meta.env.VITE_APP_USER_SERVICE_URL || 'http://localhost:8080/api/v1/users'}/info`,
            {
              headers: {
                Authorization: `Bearer ${response.data.access_token}`,
              },
            },
          );

          if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user info');
          }

          const userInfoData = await userInfoResponse.json();

          // Decode token to get Keycloak user info
          const tokenParts = response.data.access_token.split('.');
          const tokenPayload = JSON.parse(atob(tokenParts[1]));

          // Create user profile with database ID
          const userProfile = {
            id: userInfoData.id, // Database user_info.id (NOT Keycloak ID!)
            userId: tokenPayload.sub, // Keycloak userId
            username:
              userInfoData.username ||
              tokenPayload.preferred_username ||
              username,
            firstName: userInfoData.firstName || tokenPayload.given_name || '',
            lastName: userInfoData.lastName || tokenPayload.family_name || '',
            email: userInfoData.email || tokenPayload.email || '',
            phoneNumber: userInfoData.phoneNumber,
            roles: [userInfoData.role] ||
              tokenPayload.realm_access?.roles || ['user'],
            avatarLink: userInfoData.avatarLink,
            isActive: userInfoData.state !== 'INACTIVE',
          };

          console.log('Login successful! User profile:', userProfile);
          console.log('Redirect to:', from);

          // Save user profile to localStorage
          localStorage.setItem(
            AUTH_STORAGE_KEYS.USER_PROFILE,
            JSON.stringify(userProfile),
          );

          setSuccess(true);

          // Show success animation then navigate
          setTimeout(() => {
            // Use navigate instead of window.location to avoid full reload
            navigate(from, { replace: true });
            // Force a state update by triggering a storage event
            window.dispatchEvent(new Event('storage'));
          }, 800);
        } catch (fetchError) {
          console.error('Failed to fetch user info:', fetchError);
          setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
        }
      } else {
        setError('Phản hồi đăng nhập thiếu token bắt buộc');
      }
    } catch (err) {
      const error = err as {
        response?: { data?: { error_description?: string } };
      };
      setError(
        error.response?.data?.error_description ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-40 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Back to Home Link */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-white hover:text-primary-200 transition-colors flex items-center gap-2 font-medium"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Về trang chủ
      </button>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white border-opacity-20 p-8 md:p-10">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <img
                  src="/images/logo.png"
                  alt="Endo4Life Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Endo4Life</h1>
            <p className="text-primary-100 text-lg">Đăng nhập vào hệ thống</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500 bg-opacity-20 backdrop-blur-sm border border-green-400 rounded-xl flex items-center gap-3 animate-fade-in">
              <MdCheckCircle
                className="text-green-300 flex-shrink-0"
                size={24}
              />
              <span className="text-green-100 font-medium">
                Đăng nhập thành công! Đang chuyển hướng...
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-400 rounded-xl flex items-center gap-3 animate-shake">
              <MdError className="text-red-300 flex-shrink-0" size={24} />
              <span className="text-red-100 text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-white text-sm font-semibold mb-2"
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdEmail className="text-primary-200" size={20} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-300"
                  placeholder="Nhập tên đăng nhập"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-white text-sm font-semibold mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdLock className="text-primary-200" size={20} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-300"
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-200 hover:text-white transition-colors"
                  disabled={loading || success}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={20} />
                  ) : (
                    <MdVisibility size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white border-opacity-30 bg-white bg-opacity-10 text-primary-600 focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer"
                  disabled={loading || success}
                />
                <span className="ml-2 text-sm text-primary-100 group-hover:text-white transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-primary-100 hover:text-white transition-colors font-medium"
                disabled={loading || success}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-white text-primary-700 font-bold py-4 px-6 rounded-xl hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={20} />
                  <span>Đang đăng nhập...</span>
                </>
              ) : success ? (
                <>
                  <MdCheckCircle size={24} />
                  <span>Thành công!</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white border-opacity-20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-primary-100">hoặc</span>
            </div>
          </div>

          {/* Additional Options */}
          <div className="text-center">
            <p className="text-primary-100 text-sm">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                className="text-white font-semibold hover:underline transition-all"
                disabled={loading || success}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-primary-100 text-sm">
            © 2025 Endo4Life. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>

      {/* Custom Animations Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
