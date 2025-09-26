import CircularProgress from '@mui/material/CircularProgress';
import clsx from 'clsx';
import { MouseEvent, ReactNode } from 'react';

interface ButtonProps {
  onClick?(event: MouseEvent): void;
  text?: string;
  textClassName?: string;
  requesting?: boolean;
  className?: string;
  children?: ReactNode;
  variant?: 'fill' | 'outline' | 'link' | 'text';
  disabled?: boolean;
  type?: 'submit' | 'reset' | 'button' | undefined;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  form?: string;
}
export function Button({
  text,
  onClick,
  requesting,
  className,
  textClassName,
  children,
  variant = 'fill',
  disabled,
  type,
  startIcon,
  endIcon,
  form,
}: ButtonProps) {
  return (
    <button
      form={form}
      className={clsx(
        {
          'relative min-h-9 flex items-center justify-center gap-1.5 font-medium':
            true,
          'pointer-events-none filter grayscale-0': requesting || disabled,
          'bg-primary text-white rounded-lg cursor-pointer hover:opacity-90 px-3':
            variant === 'fill',
          'text-primary bg-white border border-primary rounded-lg cursor-pointer hover:opacity-90 px-3':
            variant === 'outline',
          'opacity-60': disabled,
        },
        className
      )}
      onClick={onClick}
      disabled={requesting || disabled}
      type={type}
    >
      {startIcon && startIcon}
      {children}
      {text && (
        <span className={clsx(textClassName, { 'opacity-0': requesting })}>
          {text}
        </span>
      )}
      {endIcon && endIcon}
      {requesting && (
        <div
          className={clsx(
            'absolute top-0 left-0 flex items-center justify-center w-full h-full',
            {
              'text-white': variant === 'fill',
              'text-primary': variant === 'outline',
              'border-none select-none': variant === 'text',
            }
          )}
        >
          <CircularProgress size={20} sx={{ color: 'inherit' }} />
        </div>
      )}
    </button>
  );
}
