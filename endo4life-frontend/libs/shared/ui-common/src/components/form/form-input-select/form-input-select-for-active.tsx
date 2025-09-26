import { FormInputSelect, FormInputSelectProps } from './form-input-select';
import { useTranslation } from 'react-i18next';

export interface FormInputSelectForActiveProps
  extends Omit<FormInputSelectProps, 'options' | 'onChange'> {
  onChange(val: boolean): void;
}

export function FormInputSelectForActive({
  onChange,
  ...props
}: FormInputSelectForActiveProps) {
  const { t } = useTranslation(['user']);
  const options = [
    { label: t('user:status.active'), value: 'true' },
    { label: t('user:status.disabled'), value: 'false' },
  ];

  return (
    <FormInputSelect
      {...props}
      options={options}
      onChange={(val) => {
        onChange(val === 'true');
      }}
    />
  );
}

export default FormInputSelectForActive;
