import React from 'react';

interface FormInputFileProps {
  label: string;
  accept: string;
  isRequired?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function FormInputFile({
  label,
  accept,
  isRequired,
  onChange,
  error,
}: FormInputFileProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className={`border p-2 rounded ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
}

export default FormInputFile;
