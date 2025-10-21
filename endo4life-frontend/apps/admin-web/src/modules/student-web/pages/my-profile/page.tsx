import { useAuthContext } from '@endo4life/feature-auth';
import {
  UpdateUserRequestDto,
  UserInfoRole,
  UserInfoState,
  UserV1Api,
  UserResponseDto,
  BaseApi,
  ResourceType,
  StorageApiImpl,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import { Avatar, Button, TextField, CircularProgress } from '@mui/material';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { PiCamera } from 'react-icons/pi';
import clsx from 'clsx';
import { useNameInitial } from '@endo4life/feature-user';

// Helper class to use UserV1Api with proper base URL
class UserApiHelper extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
  }

  async getUserApi() {
    const config = await this.getApiConfiguration();
    return new UserV1Api(config);
  }
}

export default function MyProfilePage() {
  const { t } = useTranslation('common');
  const { userProfile: authUserProfile } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [userInfo, setUserInfo] = useState<UserResponseDto | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const firstCharacterName = useNameInitial(authUserProfile);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  // Load user info on mount
  useEffect(() => {
    const loadUserInfo = async () => {
      if (!authUserProfile?.id) return;

      try {
        setLoadingUserInfo(true);
        const helper = new UserApiHelper();
        const api = await helper.getUserApi();
        const response = await api.getUserById({ id: authUserProfile.id });
        setUserInfo(response.data);

        // Set form data
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phoneNumber: response.data.phoneNumber || '',
        });

        // Set avatar preview
        setAvatarPreview(response.data.avatarLink || null);
      } catch (error) {
        console.error('Error loading user info:', error);
        toast.error('Không thể tải thông tin người dùng', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoadingUserInfo(false);
      }
    };

    loadUserInfo();
  }, [authUserProfile?.id]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!userInfo?.id) {
        toast.error('Không tìm thấy thông tin người dùng', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);

      try {
        let avatarObjectKey: string | undefined;

        // Step 1: Upload avatar to MinIO if changed
        if (avatarFile) {
          const storageApi = new StorageApiImpl(
            EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080',
          );

          try {
            avatarObjectKey = await storageApi.uploadFile(
              avatarFile,
              ResourceType.Avatar,
            );
          } catch (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            toast.error('Không thể tải lên ảnh đại diện. Vui lòng thử lại.', {
              position: 'top-right',
              autoClose: 3000,
            });
            setLoading(false);
            return;
          }
        }

        // Step 2: Update user with object key
        const helper = new UserApiHelper();
        const api = await helper.getUserApi();

        const updateData: UpdateUserRequestDto = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          role: userInfo.role as UserInfoRole,
          state: userInfo.state as UserInfoState,
          avatar: avatarObjectKey, // Send UUID object key instead of File
        };

        await api.updateUser({
          id: userInfo.id,
          updateUserRequestDto: updateData,
        });

        toast.success('Cập nhật thông tin thành công!', {
          position: 'top-right',
          autoClose: 2000,
        });

        // Reload user info to get new avatar presigned URL
        const response = await api.getUserById({ id: userInfo.id });
        setUserInfo(response.data);
        setAvatarPreview(response.data.avatarLink || null);
        setAvatarFile(null);
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Cập nhật thông tin thất bại. Vui lòng thử lại.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    [userInfo, formData, avatarFile],
  );

  if (loadingUserInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('account.txtProfile')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý thông tin cá nhân và ảnh đại diện của bạn
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          {/* Avatar Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Ảnh đại diện
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  alt="avatar"
                  src={avatarPreview || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                  }}
                >
                  {!avatarPreview && firstCharacterName}
                </Avatar>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className={clsx(
                    'absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white',
                    'hover:bg-blue-700 transition-colors shadow-lg',
                  )}
                >
                  <PiCamera size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Ảnh đại diện giúp mọi người nhận diện bạn dễ dàng hơn
                </p>
                <p className="text-xs text-gray-500">JPG, PNG. Tối đa 5MB</p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Thông tin cá nhân
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Họ và tên đệm
                </label>
                <TextField
                  id="lastName"
                  fullWidth
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  placeholder="Nhập họ và tên đệm"
                  variant="outlined"
                  size="small"
                />
              </div>

              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tên
                </label>
                <TextField
                  id="firstName"
                  fullWidth
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  placeholder="Nhập tên"
                  variant="outlined"
                  size="small"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <TextField
                  id="email"
                  fullWidth
                  value={userInfo?.email || ''}
                  disabled
                  variant="outlined"
                  size="small"
                  helperText="Email không thể thay đổi"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Số điện thoại
                </label>
                <TextField
                  id="phoneNumber"
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange('phoneNumber', e.target.value)
                  }
                  placeholder="Nhập số điện thoại"
                  variant="outlined"
                  size="small"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setFormData({
                  firstName: userInfo?.firstName || '',
                  lastName: userInfo?.lastName || '',
                  phoneNumber: userInfo?.phoneNumber || '',
                });
                setAvatarFile(null);
                setAvatarPreview(userInfo?.avatarLink || null);
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} />}
              sx={{
                backgroundColor: '#2c224c',
                '&:hover': {
                  backgroundColor: '#1a1530',
                },
              }}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
