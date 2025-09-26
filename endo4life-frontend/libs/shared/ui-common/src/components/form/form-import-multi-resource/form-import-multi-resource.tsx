import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdOutlineFileUpload } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';

export interface FormImportMultiResourceProps {
  label?: string;
  isRequired?: boolean;
  value?: File[] | null;
  onChange?: (files: File[]) => void;
  errMessage?: string;
  className?: string;
  accept: string;
}

export function FormImportMultiResource({
  label,
  isRequired,
  value,
  onChange,
  errMessage,
  className,
  accept,
}: FormImportMultiResourceProps) {
  const [files, setFiles] = useState<File[]>(value || []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (accept === '.zip' && file.type === 'application/zip') {
          validFiles.push(file);
        } else if (
          accept === 'image/*,video/*' &&
          (file.type.startsWith('image/') || file.type.startsWith('video/'))
        ) {
          validFiles.push(file);
        } else {
          toast.error('File tải lên không hợp lệ');
        }
      }
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onChange && onChange(updatedFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange && onChange(updatedFiles);
  };

  useEffect(() => {
    if (value && value.length > 0) {
      setFiles(value);
    } else {
      setFiles([]);
    }
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
        {files.length > 0 ? (
          files.map((file, index) => (
            <div
              key={index}
              className="file-item flex items-center gap-2 p-2 bg-gray-100 rounded-xl hover:text-blue-500 hover:duration-300"
            >
              <a
                href={URL.createObjectURL(file)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 truncate"
              >
                {file.name}
              </a>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-black"
              >
                <AiOutlineClose />
              </button>
            </div>
          ))
        ) : (
          <p className="text-yellow-600 pb-4">Không có file nào được tải lên</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label
          htmlFor="file-upload"
          className="px-3 py-2 border cursor-pointer rounded-lg btn btn-primary relative"
        >
          <MdOutlineFileUpload className="absolute top-1/2 left-3 -translate-y-2/4 font-bold text-2xl" />
          <span className="ml-8 text-sm">Tải file lên</span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </div>
      {errMessage && (
        <div className="text-sm text-red-500 pt-4">{errMessage}</div>
      )}
    </div>
  );
}
