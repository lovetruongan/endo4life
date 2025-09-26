import clsx from 'clsx';
import { IOption } from '@endo4life/types';

export interface FormInputRadioProps {
  name?: string;
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
  className?: string;
  optionsClassName?: string;
  onChange?(val?: string): void;
  onSubmit?(val: string): void;
}

export function FormInputRadio({
  name,
  label,
  isRequired,
  value,
  labelColor,
  errMessage,
  hint,
  disabled,
  options,
  className,
  onChange,
  onSubmit,
  optionsClassName,
}: FormInputRadioProps) {
  return (
    <div className={clsx('space-y-2 overflow-hidden', className)}>
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
        <ul className={optionsClassName}>
          {options.map((option) => {
            return (
              <li
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onSubmit && onSubmit(option.value)}
              >
                <input
                  type="radio"
                  title="radioinput"
                  checked={option.value === value}
                  onChange={() => {
                    onChange && onChange(option.value);
                    onSubmit && onSubmit(option.value);
                  }}
                  name={name}
                />
                <span>{option.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
      {hint && <div className="text-sm text-slate-700">{hint}</div>}
    </div>
  );
}

export default FormInputRadio;
