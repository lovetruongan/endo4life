import clsx from 'clsx';
import React from 'react';
import { useState } from 'react';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';
import { IOption } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
export interface FormInputSelectProps {
  label?: string;
  labelColor?: string;
  isRequired?: boolean;
  value?: string;
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  options: IOption[];
  async?: boolean;
  className?: string;
  CustomOption?: React.FC<any>;
  noOptionsMessage?: string;
  loadOptions?: (input: string) => Promise<IOption[]>;
  onChange?(val?: string): void;
  onSubmit?(val: string): void;
}

export function FormInputSelect({
  label,
  isRequired,
  value,
  labelColor,
  errMessage,
  hint,
  disabled,
  clearable = true,
  placeholder,
  options,
  async,
  className,
  CustomOption,
  noOptionsMessage,
  loadOptions,
  onChange,
  onSubmit,
}: FormInputSelectProps) {
  const { t } = useTranslation(['common']);
  const [asyncOptions, setAsyncOptions] = useState<IOption[]>([]);

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium" style={{ color: labelColor }}>
            {label}
          </h3>
          {isRequired && <span className="text-sm text-red-500">*</span>}
          <span className="flex-auto"></span>
        </div>
      )}
      <div className="relative">
        {!async && (
          <ReactSelect
            isDisabled={disabled}
            isClearable={clearable}
            placeholder={placeholder}
            value={options.find((c) => c.value === value)}
            options={options}
            onChange={(option) => {
              onChange && onChange(option?.value ?? '');
              onSubmit && onSubmit(option?.value ?? '');
            }}
            menuPosition="fixed"
            menuPlacement="auto"
            components={CustomOption ? { Option: CustomOption } : {}}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999999 }),
              control: (base) => ({
                ...base,
                boxShadow: 'none',
                borderRadius: '8px',
                minHeight: '36px',
                borderColor: '#cbd5e1',
              }),
              input: (base) => ({
                ...base,
                "input[type='text']:focus": { boxShadow: 'none' },
              }),
            }}
            menuPortalTarget={document.body}
            isOptionDisabled={(option) => !!option.disabled}
            noOptionsMessage={({ inputValue }) => {
              return noOptionsMessage ?? t('common:noResults');
            }}
          />
        )}

        {async && loadOptions && (
          <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            menuPosition="fixed"
            menuPlacement="auto"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999999 }),
              control: (base) => ({
                ...base,
                boxShadow: 'none',
                borderRadius: '8px',
              }),
              input: (base) => ({
                ...base,
                "input[type='text']:focus": { boxShadow: 'none' },
              }),
            }}
            components={CustomOption ? { Option: CustomOption } : {}}
            menuPortalTarget={document.body}
            isOptionDisabled={(option) => !!option.disabled}
            isDisabled={disabled}
            isClearable={clearable}
            placeholder={placeholder}
            value={asyncOptions.find((c) => c.value === value)}
            noOptionsMessage={({ inputValue }) => {
              return inputValue
                ? noOptionsMessage ?? t('common:noResults')
                : '';
            }}
            onChange={(option) => {
              onChange && onChange(option?.value ?? '');
              onSubmit && onSubmit(option?.value ?? '');
            }}
          />
        )}
      </div>
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
      {hint && <div className="text-sm text-slate-700">{hint}</div>}
    </div>
  );
}

export default FormInputSelect;
