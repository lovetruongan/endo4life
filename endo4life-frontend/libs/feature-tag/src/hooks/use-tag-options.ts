import { useCallback, useEffect, useMemo, useState } from 'react';
import { IOption } from '@endo4life/types';
import { useQuery } from 'react-query';
import { TagApiImpl } from '../api';
import { TagMapper } from '../types';

export function useTagOptions(defaultValue = '') {
  const { isLoading, data: options = [] } = useQuery<IOption[], Error>(
    ['getAllTags'],
    async () => {
      const api = new TagApiImpl();
      const mapper = new TagMapper();
      return api.getTags([]).then((res) => res.map(mapper.toOption));
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
    }
  );

  const [value, setValue] = useState(defaultValue);

  const option = useMemo(() => {
    return options?.find((item) => item?.value === value);
  }, [options, value]);

  const getOptionByValue = useCallback(
    (value?: string) => {
      return options?.find((item) => item?.value === value);
    },
    [options]
  );

  const onChange = useCallback(
    (newOption?: IOption) => {
      if (newOption &&  Object.prototype.hasOwnProperty.call(newOption, "value")) {
        setValue(newOption['value']);
      } else {
        setValue(defaultValue);
      }
    },
    [defaultValue, setValue]
  );

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return {
    loading: isLoading,
    options,
    value,
    setValue,
    option,
    onChange,
    getOptionByValue,
  };
}
