import { IOption } from '@endo4life/types';
import clsx from 'clsx';
import { useState } from 'react';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';

export interface FormInputMultiSelectProps {
  label?: string;
  isRequired?: boolean;
  isIgnoredValidating?: boolean;
  value?: string[];
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  options: IOption[];
  async?: boolean;
  className?: string;
  CustomOption?: React.FC<any>;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  loadOptions?: (input: string) => Promise<IOption[]>;
  onChange?(val?: string[]): void;
  onSubmit?(val: string[]): void;
}

export function FormInputMultiSelect({
  label,
  isRequired,
  isIgnoredValidating = false,
  value,
  errMessage,
  hint,
  disabled,
  clearable = true,
  placeholder,
  options,
  async,
  className,
  CustomOption,
  closeMenuOnSelect = true,
  hideSelectedOptions = true,
  loadOptions,
  onChange,
  onSubmit,
}: FormInputMultiSelectProps) {
  const [asyncOptions, setAsyncOptions] = useState<IOption[]>([]);

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium">{label}</h3>
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
            closeMenuOnSelect={closeMenuOnSelect}
            hideSelectedOptions={hideSelectedOptions}
            isMulti
            value={options.filter((c) => value?.includes(c.value))}
            options={options}
            onChange={(option) => {
              onChange && onChange(option.map((o) => o.value));
              onSubmit && onSubmit(option.map((o) => o.value));
            }}
            menuPosition="fixed"
            menuPlacement="auto"
            components={CustomOption ? { Option: CustomOption } : {}}
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 999999,
                boxShadow: 'none',
              }),
              control: (base) => ({
                ...base,
                boxShadow: 'none',
                borderRadius: '6px',
              }),
              input: (base) => ({
                ...base,
                boxShadow: 'none',
                "input[type='text']:focus": { boxShadow: 'none' },
              }),
              valueContainer: (base) => ({ ...base, boxShadow: 'none' }),
              multiValue: (base) => ({ ...base, boxShadow: 'none' }),
            }}
            menuPortalTarget={document.body}
            isOptionDisabled={(option) => !!option.disabled}
          />
        )}

        {async && loadOptions && (
          <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            menuPosition="fixed"
            menuPlacement="auto"
            components={CustomOption ? { Option: CustomOption } : {}}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 999999 }),
              control: (base) => ({ ...base, boxShadow: 'none' }),
              input: (base) => ({
                ...base,
                "input[type='text']:focus": { boxShadow: 'none' },
              }),
            }}
            isMulti
            menuPortalTarget={document.body}
            isOptionDisabled={(option) => !!option.disabled}
            isDisabled={disabled}
            isClearable={clearable}
            placeholder={placeholder}
            value={asyncOptions.find((c) => value?.includes(c.value))}
            onChange={(option) => {
              onChange && onChange(option.map((o) => o.value));
              onSubmit && onSubmit(option.map((o) => o.value));
            }}
          />
        )}
      </div>
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
      {hint && <div className="text-sm text-slate-700">{hint}</div>}
    </div>
  );
}

export default FormInputMultiSelect;
