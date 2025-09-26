import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IOption } from '@endo4life/types';
import { ITagFormData, useTags } from '@endo4life/feature-tag';

interface IUseImageTagOptionsProps {
  parentTags?: string[];
  defaultValue?: string;
  currentValues?: string[];
}

export function useImageTagOptions({
  parentTags = [], // ids
  defaultValue = '',
}: IUseImageTagOptionsProps) {
  const { t } = useTranslation('image');
  const { data } = useTags(parentTags || []);

  const options: IOption<ITagFormData>[] = useMemo<IOption[]>(() => {
    const options =
      data?.map((tag) => ({
        label: tag.content,
        value: tag.id,
        metadata: tag,
      })) || [];
    return options;
  }, [t, data]);

  const [value, setValue] = useState(defaultValue);

  const option = useMemo(() => {
    return options.find((item) => item?.value === value);
  }, [options, value]);

  const getOptionByValue = useCallback(
    (value?: string) => {
      return options.find((item) => item?.value === value);
    },
    [options, value],
  );

  const onChange = useCallback(
    (newOption?: IOption) => {
      if (
        newOption &&
        Object.prototype.hasOwnProperty.call(newOption, 'value')
      ) {
        setValue(newOption['value']);
      } else {
        setValue(defaultValue);
      }
    },
    [defaultValue, setValue],
  );

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return { options, value, setValue, option, onChange, getOptionByValue };
}
