import clsx from 'clsx';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { VscClose } from 'react-icons/vsc';

export interface FormInputTextareaProps {
  label?: string;
  isRequired?: boolean;
  value?: string;
  onChange?(val?: string): void;
  onSubmit?(val: string): void;
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function FormInputTextarea({
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
  className,
}: FormInputTextareaProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [_val, setValue] = useState(value ?? '');
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value ?? '';
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
      <div className="relative overflow-hidden">
        <textarea
          ref={inputRef}
          disabled={disabled}
          defaultValue={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(_evt) => {
            if (!inputRef.current) return;
            const val = inputRef.current?.value.trim();
            setValue(val);
            onChange && onChange(val);
          }}
          onKeyDown={(evt) => {
            if (evt.key !== 'Enter') return;
            evt.preventDefault();
            evt.stopPropagation();
            if (!inputRef.current) return;
            const val = inputRef.current?.value.trim();
            onSubmit && onSubmit(val);
          }}
          onBlur={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (!inputRef.current) return;
            const val = inputRef.current?.value.trim();
            onSubmit && onSubmit(val);
          }}
          className={clsx(
            'w-full px-3 py-2 rounded-md form-input border-slate-300 focus:ring-0 focus:outline-none border',
            {
              'border-red-500': !!errMessage,
              'focus:border-blue-500': !errMessage,
              'pr-8': clearable,
            }
          )}
          style={{ minHeight: '5.5rem' }}
        />
        {clearable && _val && _val.trim().length > 0 && (
          <button
            className="absolute transform right-4 top-2"
            title="clearbutton"
            onClick={(evt) => {
              if (!inputRef.current) return;
              evt.preventDefault();
              evt.stopPropagation();
              inputRef.current.value = '';
              setValue('');
              onChange && onChange('');
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

export default FormInputTextarea;
