import { ResourceState } from '@endo4life/data-access';
import { IOption } from '@endo4life/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useImageStateOptions(defaultValue = '') {
  const { t } = useTranslation('image');
  const options = useMemo<IOption[]>(() => {
    return [
      {
        label: t(`state.${ResourceState.Public.toString()}`),
        value: ResourceState.Public.toString(),
      },
      {
        label: t(`state.${ResourceState.Unlisted.toString()}`),
        value: ResourceState.Unlisted.toString(),
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

export default useImageStateOptions;
