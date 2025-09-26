import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IOption } from '@endo4life/types';
import {
  ITagFormData,
  useTags,
} from '@endo4life/feature-tag';

interface IUseVideoTagOptionsProps {
  parentTags?: string[];
  defaultValue?: string;
  currentValues?: string[];
}

export function useVideoTagOptions({
  parentTags = [], // ids
  defaultValue = '',
  currentValues = [], // contents
}: IUseVideoTagOptionsProps) {
  const { t } = useTranslation('user');
  const { data } = useTags(parentTags || []);

  const options: IOption<ITagFormData>[] = useMemo<IOption[]>(() => {
    const options =
      data?.map((tag) => ({
        label: tag.content,
        value: tag.id,
        metadata: tag,
      })) || [];
    return options;
  }, [data]);

  const selectedOptions = currentValues.map((content) => {
    return options.find((opt) => opt.label === content);
  });

  const [value, setValue] = useState(defaultValue);

  const option = useMemo(() => {
    return options.find((item) => item?.value === value);
  }, [options, value]);

  const getOptionByValue = useCallback(
    (value?: string) => {
      return options.find((item) => item?.value === value);
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
    [defaultValue, setValue]
  );

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return { options, value, setValue, option, onChange, getOptionByValue };
}
