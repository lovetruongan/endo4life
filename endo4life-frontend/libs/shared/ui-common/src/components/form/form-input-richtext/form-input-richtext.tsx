import { RichTextEditor } from '@endo4life/feature-richtext-editor';
import clsx from 'clsx';

export interface FormInputRichTextProps {
  name?: string;
  label?: string;
  isRequired?: boolean;
  value?: string;
  onChange?(val?: string): void;
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  toolbarHidden?: boolean;
  className?: string;
  inputContainerClassName?: string;
  autofocus?: boolean;
}

export function FormInputRichText({
  name,
  label,
  isRequired,
  value,
  onChange,
  errMessage,
  hint,
  inputContainerClassName,
  placeholder,
  toolbarHidden = true,
  className,
  autofocus,
}: FormInputRichTextProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium">{label}</h3>
          {isRequired && <span className="text-sm text-red-500">*</span>}
          <span className="flex-auto"></span>
        </div>
      )}
      <div
        className={clsx(
          'relative overflow-hidden rounded border border-slate-300 focus-within:border-blue-500',
          inputContainerClassName,
        )}
      >
        <RichTextEditor
          autofocus={autofocus}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name ?? label ?? 'lexical-editor'}
          options={{ toolbarHidden }}
        />
      </div>
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
      {hint && <div className="text-sm text-slate-700">{hint}</div>}
    </div>
  );
}

export default FormInputRichText;
