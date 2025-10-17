import { useMemo } from 'react';
import Select, { MultiValue } from 'react-select';
import clsx from 'clsx';
import { IOption } from '@endo4life/types';

export interface FormSelectMultiProps {
  label?: string;
  isRequired?: boolean;
  value?: string[];
  onChange?(val: string[]): void;
  options: IOption[];
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function FormSelectMulti({
  label,
  isRequired,
  value,
  onChange,
  options,
  errMessage,
  hint,
  disabled,
  placeholder,
  className,
}: FormSelectMultiProps) {
  const selectedOptions = useMemo(
    () => options.filter((item) => value?.includes(item.value)),
    [options, value],
  );

  const handleChange = (selected: MultiValue<IOption> | undefined) => {
    onChange && onChange(selected?.map((item) => item.value) || []);
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium">{label}</h3>
          {isRequired && <span className="text-sm text-red-500">*</span>}
        </div>
      )}
      <Select
        isMulti
        isDisabled={disabled}
        value={selectedOptions}
        onChange={handleChange}
        options={options}
        className={clsx('react-select-container', {
          'border-red-500': !!errMessage,
          'border-slate-300': !errMessage,
        })}
        classNamePrefix="react-select"
        placeholder={placeholder}
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999999 }),
          menuList: (base) => ({
            ...base,
            maxHeight: '100px',
            overflowY: 'auto',
          }),
          control: (base) => ({
            ...base,
            boxShadow: 'none',
            borderRadius: '6px',
          }),
        }}
      />
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
      {hint && <div className="text-sm text-slate-700">{hint}</div>}
    </div>
  );
}

export default FormSelectMulti;
