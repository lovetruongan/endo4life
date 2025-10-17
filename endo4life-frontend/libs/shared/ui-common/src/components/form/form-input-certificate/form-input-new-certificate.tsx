import React, { useState, useEffect } from 'react';
import { MdOutlineFileUpload } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export interface FormInputNewCertificateProps {
  label?: string;
  value?: File[] | null;
  onChange?: (files: File[]) => void;
  errMessage?: string;
  className?: string;
  certificateLinks?: string[];
  idUser?: string;
  onRemoveLink?: (link: string) => void;
}

export function FormInputNewCertificate({
  label,
  value = [],
  onChange,
  errMessage,
  className,
  certificateLinks = [],
  idUser,
  onRemoveLink,
}: FormInputNewCertificateProps) {
  const { t } = useTranslation('user');
  const [files, setFiles] = useState<File[]>(value || []);
  const [certLinks, setCertLinks] = useState<string[]>(certificateLinks);

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

  const handleRemoveLink = (index: number) => {
    const linkToRemove = certLinks[index];
    const fileName = linkToRemove.split('/').pop();
    const updatedLinks = certLinks.filter((_, i) => i !== index);
    setCertLinks(updatedLinks);

    if (fileName && onRemoveLink) {
      onRemoveLink(fileName);
    }
  };

  const getFileName = (filePath: string, idUser?: string) => {
    const fileName = filePath.split('/').pop() || filePath;

    if (idUser && fileName.startsWith(idUser)) {
      return fileName.replace(`${idUser}_`, '');
    }

    const nameParts = fileName.split('_');
    return nameParts.length > 1 ? nameParts.slice(1).join('_') : fileName;
  };

  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(files)) {
      setFiles(value || []);
    }
  }, [value, files]);

  useEffect(() => {
    if (certificateLinks && certificateLinks.length > 0) {
      setCertLinks(certificateLinks);
    } else {
      setCertLinks([]);
    }
  }, [certificateLinks]);

  return (
    <div className={`fileContainer ${className}`}>
      {label && <h3 className="mb-2 text-sm font-medium">{label}</h3>}
      <div className="flex gap-2 file-list">
        {files.length > 0 && (
          <>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-100 file-item rounded-xl"
              >
                <a
                  href={URL.createObjectURL(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.name}
                </a>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-black"
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}
          </>
        )}

        {certLinks.length > 0 && (
          <>
            {certLinks.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-100 file-item rounded-xl"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500"
                >
                  {getFileName(link, idUser)}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="text-black"
                >
                  <AiOutlineClose />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="flex items-center gap-4 mt-2">
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
