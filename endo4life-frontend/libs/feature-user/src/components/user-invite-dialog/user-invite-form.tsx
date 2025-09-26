import { IUserInviteFormData } from '../../types';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import * as yup from 'yup';
import {
  UserInfoRole,
  UserInfoState,
} from '@endo4life/data-access';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import {
  Button,
  FormInputSelect,
  FormInputText,
} from '@endo4life/ui-common';
import useUserRoleOptions from '../../hooks/use-user-role-options';
import isEmail from 'validator/lib/isEmail';
import { useUserNewStatusOptions } from '../../hooks';

interface Props {
  loading?: boolean;
  data?: IUserInviteFormData;
  onSubmit(data: IUserInviteFormData): void;
  onClose(): void;
}

export const UserInviteForm = ({
  loading,
  data = {
    state: UserInfoState.Pending,
    email: '',
    role: UserInfoRole.Customer,
  },
  onSubmit,
  onClose,
}: Props) => {
  const { options: roleOptions } = useUserRoleOptions();
  const { options: stateOptions } = useUserNewStatusOptions();
  const { t } = useTranslation(['common', 'user']);
  const schema = useMemo(() => {
    return yup.object({
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
      role: yup
        .mixed<UserInfoRole>()
        .oneOf(
          Object.values(UserInfoRole),
          t('common:txtInvalidFormatField').replace(
            '{{field_name}}',
            t('user:basicInfo.role'),
          ),
        )
        .required()
        .default(UserInfoRole.Customer),
      state: yup
        .mixed<UserInfoState>()
        .oneOf(
          Object.values(UserInfoState),
          t('common:txtInvalidFormatField').replace(
            '{{field_name}}',
            t('user:basicInfo.state'),
          ),
        )
        .required()
        .default(UserInfoState.Pending),
    });
  }, []);

  const { control, handleSubmit, formState } = useForm<IUserInviteFormData>({
    resolver: yupResolver(schema),
    defaultValues: data,
    mode: 'onChange',
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx({
        'pointer-events-none cursor-default opacity-60': loading,
        'space-y-6': true,
      })}
    >
      <div className="grid grid-cols-1 gap-6">
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value, name } }) => {
            return (
              <FormInputText
                autofocus
                key={name}
                type="email"
                className="text-gray-600"
                label={t('user:inviteForm.emailFieldLabel')}
                placeholder={t('user:inviteForm.emailFieldPlaceholder')}
                isRequired
                value={value}
                onChange={onChange}
                errMessage={formState.errors.email?.message}
              />
            );
          }}
        />

        <div className="flex justify-between gap-4">
          <Controller
            name="role"
            control={control}
            render={({ field: { onChange, value, name } }) => {
              return (
                <FormInputSelect
                  className="flex-1 text-gray-600"
                  label={t('user:inviteForm.roleFieldLabel')}
                  placeholder={t('user:inviteForm.roleFieldPlaceholder')}
                  isRequired
                  value={value}
                  options={roleOptions}
                  onSubmit={onChange}
                  errMessage={formState.errors.role?.message}
                />
              );
            }}
          />
          <Controller
            name="state"
            control={control}
            render={({ field: { onChange, value, name } }) => {
              return (
                <FormInputSelect
                  className="flex-1 text-gray-600"
                  label={t('user:inviteForm.statusFieldLabel')}
                  isRequired
                  disabled={true}
                  value={value}
                  options={stateOptions}
                  onSubmit={onChange}
                  errMessage={formState.errors.state?.message}
                />
              );
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4">
        <Button
          text={t('common:txtCancel')}
          onClick={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            onClose();
          }}
          className="h-12 py-2 text-sm font-bold px-9 border-1"
          variant="outline"
        />
        <Button
          text={t('common:txtSend')}
          type="submit"
          variant="fill"
          requesting={loading}
          className="h-12 py-4 text-sm font-bold px-9"
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default UserInviteForm;
