import { IOption } from '@endo4life/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { QuestionTypeEnum } from '../types';

export function useQuestionTypeOptions(defaultValue = '') {
  const options = useMemo<IOption[]>(() => {
    return [
      {
        label: 'Câu hỏi 1 đáp án',
        value: QuestionTypeEnum.SINGLE_CHOICE.toString(),
      },
      {
        label: 'Câu hỏi nhiều đáp án',
        value: QuestionTypeEnum.MULTIPLE_CHOICE.toString(),
      },
      {
        label: 'Câu hỏi tự luận',
        value: QuestionTypeEnum.FREE_TEXT.toString(),
      },
    ];
  }, []);
  const [value, setValue] = useState(defaultValue);

  const option = useMemo(() => {
    return options.find((item) => item.value === value);
  }, [options, value]);

  const getOptionByValue = useCallback(
    (value?: string) => {
      return options.find((item) => item.value === value);
    },
    [options],
  );

  const onChange = useCallback(
    (newOption?: any) => {
      if (newOption && newOption.hasOwnProperty('value')) {
        setValue(newOption['value']);
      } else {
        setValue(defaultValue);
      }
    },
    [defaultValue],
  );

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return { options, value, setValue, option, onChange, getOptionByValue };
}