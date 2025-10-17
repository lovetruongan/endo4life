import { UserInfoRole } from '@endo4life/data-access';
import { IOption } from '@endo4life/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useUserRoleOptions(defaultValue = '') {
  const { t } = useTranslation('user');
  const options = useMemo<IOption[]>(() => {
    return [
      {
        label: t(`roles.${UserInfoRole.Admin.toString()}`),
        value: UserInfoRole.Admin.toString(),
      },
      {
        label: t(`roles.${UserInfoRole.Coordinator.toString()}`),
        value: UserInfoRole.Coordinator.toString(),
      },
      {
        label: t(`roles.${UserInfoRole.Customer.toString()}`),
        value: UserInfoRole.Customer.toString(),
      },
      {
        label: t(`roles.${UserInfoRole.Specialist.toString()}`),
        value: UserInfoRole.Specialist.toString(),
      },
    ];
  }, [t]);
  const [value, setValue] = useState(defaultValue);

  const option = useMemo(() => {
    return options.find((item) => item.value === value);
  }, [options, value]);

  const getOptionByValue = useCallback(
    (value?: string) => {
      return options.find((item) => item.value === value);
    },
    [options]
  );

  const onChange = useCallback(
    (newOption?: IOption) => {
      if (newOption && Object.prototype.hasOwnProperty.call(newOption, "value")) {
        setValue(newOption['value']);
      } else {
        setValue(defaultValue);
      }
    },
    [defaultValue]
  );

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return { options, value, setValue, option, onChange, getOptionByValue };
}

export default useUserRoleOptions;
