import { UserInfoState } from '@endo4life/data-access';
import { IOption } from '@endo4life/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useUserNewStatusOptions(defaultValue = '') {
  const { t } = useTranslation('user');
  const options = useMemo<IOption[]>(() => {
    return [
      {
        label: t(`state.${UserInfoState.Active.toString()}`),
        value: UserInfoState.Active.toString(),
      },
      {
        label: t(`state.${UserInfoState.Inactive.toString()}`),
        value: UserInfoState.Inactive.toString(),
      },
      {
        label: t(`state.${UserInfoState.Pending.toString()}`),
        value: UserInfoState.Pending.toString(),
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

export default useUserNewStatusOptions;
