import React, { useState, useEffect } from 'react';
import styles from '../form-input-avatar/form-avatar.module.css';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { MdOutlineFileUpload } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';

export interface FormInputCertificateProps {
  label?: string;
  isRequired?: boolean;
  value?: File[] | null;
  onChange?: (files: File[]) => void;
  errMessage?: string;
  className?: string;
  certificateLinks?: string[];
}

export function FormInputCertificate({
  label,
  isRequired,
  value,
  onChange,
  errMessage,
  className,
  certificateLinks,
}: FormInputCertificateProps) {
  const { t } = useTranslation('user');
  const [files, setFiles] = useState<File[]>(value || []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.type === 'application/pdf' || file.type === 'image/png') {
          validFiles.push(file);
        } else {
          toast.error(t('basicInfo.invalidFileType'));
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
        <div className={styles.label}>
          <h3 className={styles.labelText}>{label}</h3>
          {isRequired && <span>*</span>}
        </div>
      )}
      <div className="flex gap-2 file-list">
        {files.length > 0 ? (
          files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-100 file-item rounded-xl hover:text-blue-500 hover:duration-300"
            >
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
                onClick={() => handleRemoveFile(index)}
                className="text-black"
              >
                <AiOutlineClose />
              </button>
            </div>
          ))
        ) : (
          <p>{t('basicInfo.noFilesUploaded')}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <label
          htmlFor="file-upload"
          className="relative px-3 py-2 border rounded-lg cursor-pointer btn btn-primary"
        >
          <MdOutlineFileUpload className="absolute text-2xl font-bold top-1/2 left-3 -translate-y-2/4" />
          <span className="ml-8 text-sm">
            {t('basicInfo.uploadFileAction')}
          </span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept="application/pdf,image/png"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </div>
      {errMessage && <div className="fileErrorText">{errMessage}</div>}
    </div>
  );
}
