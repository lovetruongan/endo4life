import clsx from 'clsx';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  IUserCreateFormData,
  phoneRegex,
  useUserNewStatusOptions,
  useUserRoleOptions,
} from '@endo4life/feature-user';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  FormInputAvatar,
  FormInputCertificate,
  FormInputSelect,
  FormInputText,
  PageHeaderUserDetail,
} from '@endo4life/ui-common';
import { useNavigate } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';
import {
  UserInfoRole,
  UserInfoState,
} from '@endo4life/data-access';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { VscArrowLeft } from 'react-icons/vsc';
import { IconButton, Tooltip } from '@mui/material';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useState } from 'react';

interface Props {
  loading?: boolean;
  onSubmit(data: IUserCreateFormData): void;
}

export function UserCreateForm({ loading, onSubmit }: Props) {
  const { t } = useTranslation(['common', 'user']);
  const navigate = useNavigate();
  const { options: roleOptions } = useUserRoleOptions();
  const { options: stateOptions } = useUserNewStatusOptions();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = yup.object({
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
      email: yup
        .string()
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:basicInfo.email'),
          ),
        )
        .test(
          'is-valid',
          t('common:txtInvalidFormatField').replace(
            '{{field_name}}',
            t('user:basicInfo.email'),
          ),
          (val) => isEmail(val || ''),
        ),
      phoneNumber: yup
        .string()
        .matches(
          phoneRegex,
          t('common:txtInvalidFormatField').replace(
            '{{field_name}}',
            t('user:basicInfo.phoneNumber'),
          ),
        )
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:basicInfo.phoneNumber'),
          ),
        ),
      role: yup
        .mixed<UserInfoRole>()
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:inviteForm.roleFieldLabel'),
          ),
        )
        .default(UserInfoRole.Customer),
      state: yup
        .mixed<UserInfoState>()
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:inviteForm.statusFieldLabel'),
          ),
        )
        .default(UserInfoState.Pending),
      password: yup
        .string()
        .trim()
        .matches(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d@$!~%+=*`?_&\-\/#^&*()]{8,}$/,
          'Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ in hoa, chữ thường, số và ký tự đặc biệt',
        )
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:basicInfo.password'),
          ),
        ),
      confirmPassword: yup
        .string()
        .trim()
        .oneOf(
          [yup.ref('password'), undefined],
          t('user:accountSecurity.invalidPasswordMatch'),
        )
        .required(
          t('common:txtRequiredField').replace(
            '{{field_name}}',
            t('user:basicInfo.confirmPassword'),
          ),
        ),
    }),
    certificate: yup.array().of(yup.mixed()).default([]),
  });

  const { control, handleSubmit, formState } = useForm<IUserCreateFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  return (
    <>
      <PageHeaderUserDetail
        title={t('user:createForm.title')}
        titleAction={
          <Tooltip title={t('common:txtBack')} className="text-black">
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
          </div>
        }
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={clsx({
          'pointer-events-none cursor-default opacity-60': loading,
          'space-y-6': true,
        })}
      >
        <div className="flex justify-center h-fit pe-4 w-90">
          <div className="px-[120px] py-12 pb-20 border-2 shadow-xl rounded-2xl w-full bg-white h-full">
            <div className="flex justify-center mb-4">
              <img src="/images/logo.png" alt="Logo" className="w-32 h-32" />
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                {t('user:createForm.title')}
              </h1>
              <p className="text-gray-500">{t('user:createForm.subtitle')}</p>
            </div>
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
                          className="flex flex-col gap-2 text-xs"
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
                            className="flex flex-col gap-2 text-xs"
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
                            className="flex flex-col gap-2 text-xs"
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
                            className="flex flex-col gap-2 text-xs"
                          />
                        </div>
                      );
                    }}
                  />
                  <Controller
                    name="user.email"
                    control={control}
                    render={({ field: { onChange, value, name } }) => {
                      return (
                        <div className="flex flex-col gap-1">
                          <FormInputText
                            key={name}
                            label={t('user:basicInfo.email')}
                            type="email"
                            isRequired
                            className="flex flex-col gap-2 text-xs"
                            onSubmit={onChange}
                            errMessage={formState.errors.user?.email?.message}
                          />
                        </div>
                      );
                    }}
                  />
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
                <div className="grid gap-3">
                  <div className="flex items-center gap-4">
                    <Controller
                      name="certificate"
                      control={control}
                      render={({ field: { onChange, value, name } }) => (
                        <FormInputCertificate
                          key={name}
                          label={t('user:basicInfo.certificate')}
                          value={value}
                          onChange={onChange}
                          errMessage={formState.errors.certificate?.message}
                          className="flex flex-col gap-2 text-xs"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <div id="security" className="grid gap-4">
                <div>
                  <h3 className="my-1 text-lg font-semibold">
                    {t('user:accountSecurity.title')}
                  </h3>
                </div>
                <div className="flex justify-between gap-6">
                  <Controller
                    name="user.password"
                    control={control}
                    render={({ field: { onChange, value, name } }) => {
                      return (
                        <div className="relative w-full">
                          <FormInputText
                            key={name}
                            label={t('user:basicInfo.password')}
                            type={showPassword ? 'text' : 'password'}
                            isRequired
                            value={value}
                            className="w-full"
                            onChange={onChange}
                            errMessage={
                              formState.errors.user?.password?.message
                            }
                          />
                          <button
                            type="button"
                            className="absolute right-10 top-[46px] transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <AiFillEyeInvisible className="text-lg hover:text-green-400 hover:duration-300" />
                            ) : (
                              <AiFillEye className="text-lg hover:text-red-400 hover:duration-300" />
                            )}
                          </button>
                        </div>
                      );
                    }}
                  />

                  <Controller
                    name="user.confirmPassword"
                    control={control}
                    render={({ field: { onChange, value, name } }) => {
                      return (
                        <div className="relative w-full">
                          <FormInputText
                            key={name}
                            label={t('user:basicInfo.confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            isRequired
                            value={value}
                            className="w-full"
                            onChange={onChange}
                            errMessage={
                              formState.errors.user?.confirmPassword?.message
                            }
                          />
                          <button
                            type="button"
                            className="absolute right-10 top-[46px] transform -translate-y-1/2 text-gray-500"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                          >
                            {showConfirmPassword ? (
                              <AiFillEyeInvisible className="text-lg hover:text-green-400 hover:duration-300" />
                            ) : (
                              <AiFillEye className="text-lg hover:text-red-400 hover:duration-300" />
                            )}
                          </button>
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
              <Button
                type="submit"
                text={t('user:createForm.title')}
                className="font-bold"
              />
            </section>
          </div>
        </div>
      </form>
    </>
  );
}

export default UserCreateForm;
