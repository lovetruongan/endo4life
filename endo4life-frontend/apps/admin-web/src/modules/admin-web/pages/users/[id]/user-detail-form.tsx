import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import {
  FormInputText,
  FormInputAvatar,
  PageHeaderUserDetail,
  FormInputSelect,
  FormCertificateManager,
} from '@endo4life/ui-common';
import { Button } from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { phoneRegex } from '@endo4life/feature-user';
import { VscArrowLeft, VscTrash } from 'react-icons/vsc';
import { IconButton, Tooltip } from '@mui/material';
import {
  IUserUpdateAccountFormData,
  UserDeleteConfirmDialog,
  useUserNewStatusOptions,
  useUserRoleOptions,
  useCertificates,
  useCertificateUpload,
  useCertificateDelete,
} from '@endo4life/feature-user';
import { useToggle } from 'ahooks';
import { stringUtils } from '@endo4life/util-common';
import { toast } from 'react-toastify';
interface Props {
  loading?: boolean;
  data?: IUserUpdateAccountFormData;
  onSubmit(data: IUserUpdateAccountFormData): void;
}

export function UserDetailForm({ loading, data, onSubmit }: Props) {
  const { id } = useParams();
  const { t } = useTranslation(['common', 'user']);
  const navigate = useNavigate();
  const { options: roleOptions } = useUserRoleOptions();
  const { options: stateOptions } = useUserNewStatusOptions();
  const [open, openDialogAction] = useToggle(false);

  // Certificate management
  const { data: certificates, isLoading: loadingCertificates } =
    useCertificates(id);
  const uploadCertificate = useCertificateUpload();
  const deleteCertificate = useCertificateDelete();

  const handleCertificateUpload = (files: File[]) => {
    if (!id) {
      toast.error('Không có ID người dùng');
      return;
    }

    uploadCertificate.mutate(
      { userId: id, files },
      {
        onSuccess: () => {
          toast.success('Tải lên chứng chỉ thành công!');
        },
        onError: (error: any) => {
          console.error('Upload error:', error);
          toast.error('Không thể tải lên chứng chỉ');
        },
      },
    );
  };

  const handleCertificateDelete = (certificateId: string) => {
    deleteCertificate.mutate(
      { certificateId, userId: id },
      {
        onSuccess: () => {
          toast.success('Đã xóa chứng chỉ');
        },
        onError: (error) => {
          console.error('Delete error:', error);
          toast.error('Không thể xóa chứng chỉ');
        },
      },
    );
  };

  const schema = yup.object({
    id: yup.string().optional().default(id),
    user: yup.object({
      firstName: yup
        .string()
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:basicInfo.firstName'),
          ),
        ),
      lastName: yup
        .string()
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:basicInfo.lastName'),
          ),
        ),
      phoneNumber: yup
        .string()
        .matches(phoneRegex, t('user:basicInfo.invalidPhoneNumber'))
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:basicInfo.phoneNumber'),
          ),
        ),
      role: yup
        .string()
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:inviteForm.roleFieldLabel'),
          ),
        ),
      state: yup
        .string()
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:inviteForm.statusFieldLabel'),
          ),
        ),
    }),
  });

  const { control, handleSubmit, formState, setValue, getValues } =
    useForm<IUserUpdateAccountFormData>({
      resolver: yupResolver(schema),
      defaultValues: data,
      mode: 'onChange',
    });

  return (
    <>
      <PageHeaderUserDetail
        title={t('user:updateForm.title')}
        titleAction={
          <Tooltip title={t('common.txtBack')} className="text-black">
            <span>
              <IconButton
                size="medium"
                className="text-black"
                disabled={loading}
                onClick={() => {
                  navigate(ADMIN_WEB_ROUTES.USERS);
                }}
              >
                <VscArrowLeft size={18} />
              </IconButton>
            </span>
          </Tooltip>
        }
        leading={
          <div className="flex items-center gap-2">
            <Button
              text={t('common:txtCancel')}
              className="border-none hover:bg-opacity-70"
              variant="outline"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                navigate(ADMIN_WEB_ROUTES.USERS);
              }}
            />
            <Button
              text={t('user:userUpdateAction')}
              variant="fill"
              requesting={loading}
              disabled={formState.isSubmitting}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        }
      />
      <form
        id="userUpdateForm"
        className={clsx({
          'pointer-events-none cursor-default opacity-60': loading,
          'space-y-6': true,
        })}
      >
        <div className="flex justify-center px-4 py-6">
          <div className="p-8 border shadow-lg rounded-2xl w-full max-w-4xl bg-white">
            <section className="space-y-8">
              <div id="info-basic" className="space-y-5">
                <div>
                  <h3 className="my-1 text-lg font-semibold">
                    {t('user:basicInfo.title')}
                  </h3>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center gap-4">
                    <Controller
                      name="avatar"
                      control={control}
                      render={({ field: { onChange, value, name } }) => (
                        <FormInputAvatar
                          key={name}
                          label={t('user:basicInfo.avatar')}
                          value={value}
                          onChange={onChange}
                          errMessage={formState.errors.avatar?.message}
                          className="flex flex-col"
                          avatarLink={data?.avatarLink}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Controller
                    name="user.lastName"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => {
                      return (
                        <div className="flex flex-col gap-1">
                          <FormInputText
                            key={name}
                            label={t('user:basicInfo.lastName')}
                            isRequired
                            value={value}
                            defaultValue={value}
                            onSubmit={onChange}
                            errMessage={
                              formState.errors.user?.lastName?.message
                            }
                            className="flex flex-col"
                          />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    name="user.firstName"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => {
                      return (
                        <div className="flex flex-col gap-1">
                          <FormInputText
                            key={name}
                            label={t('user:basicInfo.firstName')}
                            isRequired
                            value={value}
                            defaultValue={value}
                            onSubmit={onChange}
                            errMessage={
                              formState.errors.user?.firstName?.message
                            }
                            className="flex flex-col"
                          />
                        </div>
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Controller
                    name="user.phoneNumber"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => {
                      return (
                        <div className="flex flex-col gap-1">
                          <FormInputText
                            key={name}
                            label={t('user:basicInfo.phoneNumber')}
                            isRequired
                            value={value}
                            defaultValue={value}
                            onSubmit={onChange}
                            errMessage={
                              formState.errors.user?.phoneNumber?.message
                            }
                            className="flex flex-col"
                          />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field: { onChange, value, name } }) => {
                      return (
                        <div className="flex flex-col gap-1">
                          <FormInputText
                            key={name}
                            label={t('user:basicInfo.email')}
                            type="email"
                            isRequired
                            defaultValue={data?.email}
                            disabled={true}
                            className="flex flex-col"
                          />
                          <label className="text-[10px] font-light">
                            {t('common:txtUneditableField')}
                          </label>
                        </div>
                      );
                    }}
                  />
                </div>

                {/* New Certificate Management */}
                <FormCertificateManager
                  label={t('user:basicInfo.certificate')}
                  userId={id}
                  certificates={certificates}
                  loading={
                    loadingCertificates ||
                    uploadCertificate.isLoading ||
                    deleteCertificate.isLoading
                  }
                  onUpload={handleCertificateUpload}
                  onDelete={handleCertificateDelete}
                  className="flex flex-col"
                />
              </div>
              <div id="security" className="grid gap-4">
                <div>
                  <h3 className="my-1 text-lg font-semibold">
                    {t('user:accountSecurity.title')}
                  </h3>
                </div>
                <div className="flex justify-between gap-4">
                  <Controller
                    name="user.role"
                    control={control}
                    render={({ field: { onChange, value, name } }) => {
                      return (
                        <FormInputSelect
                          className="flex-1 font-medium"
                          label={t('user:inviteForm.roleFieldLabel')}
                          placeholder={t(
                            'user:inviteForm.roleFieldPlaceholder',
                          )}
                          isRequired
                          value={value}
                          options={roleOptions}
                          onSubmit={onChange}
                          errMessage={formState.errors.user?.role?.message}
                        />
                      );
                    }}
                  />
                  <Controller
                    name="user.state"
                    control={control}
                    render={({ field: { onChange, value, name } }) => {
                      return (
                        <FormInputSelect
                          className="flex-1 font-medium"
                          label={t('user:inviteForm.statusFieldLabel')}
                          placeholder={t('user:inviteForm.statusFieldLabel')}
                          isRequired
                          value={value}
                          options={stateOptions}
                          onSubmit={onChange}
                          errMessage={formState.errors.user?.state?.message}
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </section>
            <div className="pt-4 border-t mt-6">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
                onClick={openDialogAction.toggle}
              >
                <VscTrash size={16} />
                <span>{t('user:userDeleteAccount')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
      {open && (
        <UserDeleteConfirmDialog
          id={stringUtils.defaultString(id)}
          onClose={openDialogAction.setLeft}
        />
      )}
    </>
  );
}
export default UserDetailForm;
