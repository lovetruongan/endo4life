import { CourseState } from '@endo4life/data-access';
import { IOption } from '@endo4life/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useCourseStateOptions(defaultValue = CourseState.Public) {
  const { t } = useTranslation('course');
  const options = useMemo<IOption[]>(() => {
    return [
      {
        label: t(`state.${CourseState.Public.toString()}`),
        value: CourseState.Public.toString(),
      },
      {
        label: t(`state.${CourseState.Draft.toString()}`),
        value: CourseState.Draft.toString(),
      },
      {
        label: t(`state.${CourseState.Private.toString()}`),
        value: CourseState.Private.toString(),
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

export default useCourseStateOptions;
