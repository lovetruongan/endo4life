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
  FormInputNewCertificate,
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
} from '@endo4life/feature-user';
import { useToggle } from 'ahooks';
import { stringUtils } from '@endo4life/util-common';
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
    newCertificates: yup.array().of(yup.mixed()).default([]).required(),
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
        <div className="flex justify-center h-fit pe-4 w-90">
          <div className="px-56 pt-5 pb-20 border-2 shadow-xl rounded-2xl w-full bg-white h-[850px]">
            <section className="grid gap-8 mb-6">
              <div id="info-basic" className="grid gap-4">
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

                <Controller
                  name="newCertificates"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <FormInputNewCertificate
                      key={name}
                      label={t('user:basicInfo.certificate')}
                      value={value}
                      onChange={onChange}
                      certificateLinks={data?.certificateLinks || []}
                      errMessage={formState.errors.newCertificates?.message}
                      idUser={data?.id}
                      className="flex flex-col"
                      onRemoveLink={(link) => {
                        const deletePaths = getValues('deleteCertificatePaths');

                        const validDeletePaths = Array.isArray(deletePaths)
                          ? deletePaths
                          : [];

                        const newLink = link.split('/').pop();

                        if (newLink) {
                          setValue('deleteCertificatePaths', [
                            ...validDeletePaths,
                            newLink,
                          ]);
                        }
                      }}
                    />
                  )}
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
            <div
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-sm font-bold text-red-500 border border-red-500 rounded-lg hover:duration-300 hover:text-red-300 hover:cursor-pointer"
              onClick={openDialogAction.toggle}
            >
              <VscTrash size={16} />
              <span>{t('user:userDeleteAccount')}</span>
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
