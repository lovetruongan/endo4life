import clsx from 'clsx';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { VscClose } from 'react-icons/vsc';

export interface FormInputNumberProps {
  label?: string;
  isRequired?: boolean;
  value?: number;
  onChange?(val?: number): void;
  onSubmit?(val: number): void;
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  className?: string;
  inputClassName?: string;
}

export function FormInputNumber({
  label,
  isRequired,
  value,
  onChange,
  onSubmit,
  errMessage,
  hint,
  disabled,
  clearable = true,
  placeholder,
  maxLength,
  min,
  max,
  className,
  inputClassName,
}: FormInputNumberProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [_val, setValue] = useState(value?.toString() ?? '');
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value?.toString() ?? '';
    }
  }, [inputRef, value]);

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium">{label}</h3>
          {isRequired && <span className="text-sm text-red-500">*</span>}
          <span className="flex-auto"></span>
          {_val && maxLength && (
            <span className="text-sm text-slate-700">
              {maxLength - _val.length}/{maxLength}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          disabled={disabled}
          defaultValue={value || undefined}
          type="number"
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          onChange={(_evt) => {
            if (!inputRef.current) return;
            const val = inputRef.current?.value.trim();
            setValue(val);
            onChange && onChange(val ? parseFloat(val) : undefined);
          }}
          onKeyDown={(evt) => {
            if (evt.key !== 'Enter') return;
            evt.preventDefault();
            evt.stopPropagation();
            if (!inputRef.current) return;
            const val = inputRef.current?.value.trim();
            onSubmit && onSubmit(parseFloat(val));
          }}
          onBlur={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (!inputRef.current) return;
            const val = inputRef.current?.value.trim();
            onSubmit && onSubmit(parseFloat(val));
          }}
          className={clsx(
            'w-full px-2 py-1 rounded form-input border border-slate-300 h-9 focus:ring-0',
            {
              'border-red-500': !!errMessage,
              'pr-8': clearable && !!_val.trim(),
            },
            inputClassName,
          )}
        />
        {clearable && _val && _val.trim().length > 0 && (
          <button
            className="absolute transform -translate-y-1/2 right-3 top-1/2"
            onClick={(evt) => {
              if (!inputRef.current) return;
              evt.preventDefault();
              evt.stopPropagation();
              inputRef.current.value = '';
              setValue('');
              onChange && onChange(undefined);
              inputRef.current.focus();
            }}
          >
            <VscClose size={16} />
          </button>
        )}
      </div>
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
      {hint && <div className="text-sm text-slate-700">{hint}</div>}
    </div>
  );
}

export default FormInputNumber;
