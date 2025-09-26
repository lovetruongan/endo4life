import { Controller, useForm } from 'react-hook-form';
import { ITestFormData, testSchema } from '../types';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';

interface Props {
  data?: ITestFormData;
  loading?: boolean;
  onSubmit(data: ITestFormData): void;
}

export function TestForm({ data, loading, onSubmit }: Props) {
  const { control, handleSubmit, formState } = useForm<ITestFormData>({
    resolver: yupResolver(testSchema),
    defaultValues: data,
    mode: 'onChange',
  });
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx({
        'pointer-events-none cursor-default opacity-60': loading,
        'space-y-6': true,
      })}
    ></form>
  );
}
