import { IOption } from '@endo4life/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OPERATORS } from '../constants';

export function useFilterOperatorOptions(defaultValue = '') {
  const options = useMemo<IOption[]>(() => {
    return OPERATORS.map((item) => ({ label: item, value: item }));
  }, []);

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
    (newOption?: any) => {
      if (newOption && newOption.hasOwnProperty('value')) {
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
