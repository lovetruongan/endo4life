import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { TagApiImpl } from '../api';
import { ITagEntity, TagMapper } from '../types';
import { IOption } from '@endo4life/types';

export function useAllTagOptions(defaultValue = '') {
  const { isLoading, data } = useQuery<ITagEntity[], Error>(
    ['getAllTagOptions'],
    async () => {
      const api = new TagApiImpl();
      return api.getAllTags();
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
    }
  );

  const [value, setValue] = useState(defaultValue);

  const tagOptions = useMemo(() => {
    const mapper = new TagMapper();
    return (data || []).map(mapper.toOption);
  }, [data]);

  const detailTagOptions = useMemo(() => {
    const detailOptions: IOption<ITagEntity>[] = [];
    for (const tagOption of tagOptions || []) {
      for (const detailOption of tagOption.children || []) {
        detailOptions.push(detailOption);
      }
    }
    return detailOptions;
  }, [tagOptions]);

  const option = useMemo(() => {
    return tagOptions?.find((item) => item?.value === value);
  }, [tagOptions, value]);

  const getOptionByValue = useCallback(
    (value?: string) => {
      return tagOptions?.find((item) => item?.value === value);
    },
    [tagOptions]
  );

  const onChange = useCallback(
    (newOption?: IOption) => {
      if (newOption && Object.prototype.hasOwnProperty.call(newOption, "value")) {
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
    tagOptions,
    detailTagOptions,
    value,
    setValue,
    option,
    onChange,
    getOptionByValue,
  };
}
