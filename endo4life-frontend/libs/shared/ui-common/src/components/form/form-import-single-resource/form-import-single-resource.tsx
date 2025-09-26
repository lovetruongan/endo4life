import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdOutlineFileUpload } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';

export interface FormImportSingleResourceProps {
  label?: string;
  isRequired?: boolean;
  value?: File | null;
  onChange?: (file: File | null) => void;
  errMessage?: string;
  className?: string;
  accept: string;
}

export function FormImportSingleResource({
  label,
  isRequired,
  value,
  onChange,
  errMessage,
  className,
  accept,
}: FormImportSingleResourceProps) {
  const [file, setFile] = useState<File | null>(value || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (selectedFile.type === 'application/zip' && accept === '.zip') {
        setFile(selectedFile);
        onChange && onChange(selectedFile);
      } else {
        toast.error('Chỉ chấp nhận file .zip');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onChange && onChange(null);
  };

  useEffect(() => {
    setFile(value || null);
  }, [value]);

  return (
    <div className={`fileContainer ${className}`}>
      {label && (
        <div className="label">
          <h3>{label}</h3>
          {isRequired && <span>*</span>}
        </div>
      )}
      <div className="grid grid-cols-6 gap-2">
        {file ? (
          <div className="file-item flex items-center justify-between gap-2 p-2 bg-gray-100 rounded-xl hover:text-blue-500 hover:duration-300">
            <a
              href={URL.createObjectURL(file)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
            >
              {file.name}
            </a>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-black"
            >
              <AiOutlineClose />
            </button>
          </div>
        ) : (
          <p className="text-yellow-600 pb-4">Chưa có file nào được tải lên</p>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <label
          htmlFor="single-file-upload"
          className="px-3 py-2 border cursor-pointer rounded-lg btn btn-primary relative"
        >
          <MdOutlineFileUpload className="absolute top-1/2 left-3 -translate-y-2/4 font-bold text-2xl" />
          <span className="ml-8 text-sm">Tải file lên</span>
        </label>
        <input
          id="single-file-upload"
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {errMessage && (
        <div className="text-sm text-red-500 pt-4">{errMessage}</div>
      )}
    </div>
  );
}
