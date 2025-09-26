import { DatePicker } from '@mui/x-date-pickers';
import clsx from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import { ReactNode, useMemo } from 'react';
import { LuCalendarDays } from 'react-icons/lu';

export interface FormInputDateProps {
  label?: string;
  labelActions?: ReactNode;
  isRequired?: boolean;
  value?: string;
  onChange?(val?: string): void;
  errMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  className?: string;
  format?: string;
}

export function FormInputDate({
  label,
  labelActions,
  isRequired,
  value,
  onChange,
  errMessage,
  hint,
  disabled,
  clearable = true,
  placeholder,
  className,
  format = 'DD/MM/YYYY',
}: FormInputDateProps) {
  const _val: Dayjs | null = useMemo(() => {
    return value ? dayjs(value) : null;
  }, [value]);

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium">{label}</h3>
          {isRequired && <span className="text-sm text-red-500">*</span>}
          <span className="flex-auto"></span>
          {labelActions}
        </div>
      )}
      <div className="relative">
        <DatePicker
          disabled={disabled}
          format={format}
          slots={{ openPickerIcon: LuCalendarDays }}
          slotProps={{ field: { clearable }, textField: { placeholder } }}
          value={_val}
          onChange={(newValue: Dayjs | null) => {
            onChange && onChange(newValue ? newValue.toISOString() : undefined);
          }}
          sx={{
            padding: 0,
            margin: 0,
            width: "100%",
            input: {
              height: 38,
              paddingTop: 0,
              paddingBottom: 0,
              outline: 0,
              border: 0,
              boxShadow: 'none !important',
              outlineOffset: 0,
            },
            fieldset: {
              borderWidth: '1px !important',
            },
            '.MuiInputAdornment-root': {
              button: {
                fontSize: '1.2rem',
              },
            },
          }}
        />
      </div>
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
      {hint && <div className="text-sm text-slate-700">{hint}</div>}
    </div>
  );
}

export default FormInputDate;
