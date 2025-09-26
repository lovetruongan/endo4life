import clsx from 'clsx';
import {
  HTMLInputTypeAttribute,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { VscClose } from 'react-icons/vsc';

export interface FormInputTextProps {
  label?: string;
  isRequired?: boolean;
  value?: string;
  onChange?(val?: string): void;
  onSubmit?(val: string): void;
  onInput?(e: React.ChangeEvent<HTMLInputElement>): void;
  onBlur?(e: React.FocusEvent<HTMLInputElement>): void;
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  icon?: ReactNode;
  maxLength?: number;
  className?: string;
  type?: HTMLInputTypeAttribute;
  autofocus?: boolean;
  defaultValue?: string;
}

export function FormInputText({
  label,
  isRequired,
  value,
  onChange,
  onSubmit,
  onInput,
  errMessage,
  hint,
  disabled,
  clearable = true,
  placeholder,
  icon,
  maxLength,
  className,
  type = 'text',
  autofocus,
  defaultValue,
}: FormInputTextProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [_val, setValue] = useState(defaultValue ? defaultValue : value);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value ?? '';
    }
  }, [inputRef, value]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = defaultValue ?? '';
    }
  }, [inputRef, defaultValue]);

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
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          autoFocus={autofocus}
          ref={inputRef}
          disabled={disabled}
          defaultValue={value}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          onInput={onInput}
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
            'w-full px-2 py-1 rounded-md form-input h-9 focus:ring-0 outline-none',
            {
              'border border-red-500': !!errMessage,
              'border border-slate-300 focus:border focus:border-blue-500':
                !errMessage,
              'pr-10': clearable,
              'pl-10': !!icon,
            }
          )}
        />
        {clearable && _val && _val.trim().length > 0 && (
          <button
            className="absolute transform -translate-y-1/2 right-3 top-1/2"
            title='clearbutton'
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

export default FormInputText;
