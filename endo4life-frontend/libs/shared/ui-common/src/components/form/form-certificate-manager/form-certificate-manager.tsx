import React, { useState } from 'react';
import { MdOutlineFileUpload, MdMenuBook, MdCalendarToday } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import { PiCertificate, PiDownload } from 'react-icons/pi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { CertificateResponseDto, CertificateType } from '@endo4life/data-access';
import { Chip, CircularProgress } from '@mui/material';

export interface FormCertificateManagerProps {
  label?: string;
  userId?: string;
  certificates?: CertificateResponseDto[];
  loading?: boolean;
  onUpload?: (files: File[]) => void;
  onDelete?: (certificateId: string) => void;
  errMessage?: string;
  className?: string;
}

export function FormCertificateManager({
  label,
  userId,
  certificates = [],
  loading = false,
  onUpload,
  onDelete,
  errMessage,
  className,
}: FormCertificateManagerProps) {
  const { t } = useTranslation('user');
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    
    if (selectedFiles && selectedFiles.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          validFiles.push(file);
        } else {
          toast.error('Chỉ chấp nhận file PDF hoặc ảnh (PNG, JPG)');
        }
      }
      
      if (validFiles.length > 0) {
        setUploadingFiles(validFiles);
        onUpload && onUpload(validFiles);
      }
    }
  };

  const handleRemoveUploadingFile = (index: number) => {
    const updated = uploadingFiles.filter((_, i) => i !== index);
    setUploadingFiles(updated);
  };

  const handleDeleteCertificate = (cert: CertificateResponseDto) => {
    if (cert.type === CertificateType.CourseCompletion) {
      toast.error('Không thể xóa chứng chỉ hoàn thành khóa học');
      return;
    }
    
    if (window.confirm(`Xác nhận xóa chứng chỉ "${cert.title}"?`)) {
      onDelete && cert.id && onDelete(cert.id);
    }
  };

  return (
    <div className={`${className}`}>
      {label && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <CircularProgress size={32} />
        </div>
      )}

      {/* Existing Certificates Grid */}
      {!loading && certificates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all duration-200 bg-white"
            >
              {/* Certificate Preview Image */}
              {cert.previewImageUrl ? (
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                  <img
                    src={cert.previewImageUrl}
                    alt={cert.title}
                    className="w-full h-auto object-contain rounded-lg shadow-md"
                  />
                  {/* Download button overlay */}
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110"
                      title="Tải xuống"
                    >
                      <PiDownload size={20} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-48 flex items-center justify-center">
                  <PiCertificate size={64} className="text-blue-400" />
                </div>
              )}
              
              {/* Certificate Info */}
              <div className="p-5 border-t-2 border-gray-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-bold text-gray-900 text-base flex-1 line-clamp-2">
                    {cert.title}
                  </h4>
                  <Chip
                    label={
                      cert.type === CertificateType.CourseCompletion
                        ? 'Khóa học'
                        : 'Chuyên môn'
                    }
                    size="small"
                    color={
                      cert.type === CertificateType.CourseCompletion
                        ? 'success'
                        : 'primary'
                    }
                    className="shrink-0"
                  />
                </div>
                {cert.courseName && (
                  <p className="text-sm text-gray-600 mb-2 font-medium flex items-center gap-1">
                    <MdMenuBook size={16} />
                    {cert.courseName}
                  </p>
                )}
                {cert.issuedAt && (
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <MdCalendarToday size={14} />
                    Cấp ngày: {new Date(cert.issuedAt).toLocaleDateString('vi-VN', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
                {cert.type === CertificateType.Professional && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCertificate(cert)}
                    className="mt-2 text-sm text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border border-red-600"
                  >
                    <AiOutlineClose size={16} />
                    Xóa chứng chỉ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Certificates Message */}
      {!loading && certificates.length === 0 && uploadingFiles.length === 0 && (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg mb-4">
          <PiCertificate size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Chưa có chứng chỉ nào</p>
        </div>
      )}

      {/* Files being uploaded */}
      {uploadingFiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Đang tải lên:</h4>
          <div className="flex flex-wrap gap-2">
            {uploadingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm"
              >
                <span className="text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveUploadingFile(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <AiOutlineClose size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <label
          htmlFor="certificate-upload"
          className="relative px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <MdOutlineFileUpload size={20} />
          <span className="text-sm">Tải lên chứng chỉ</span>
        </label>
        <input
          id="certificate-upload"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/jpg"
          className="hidden"
          multiple
          onChange={handleFileChange}
          disabled={loading}
        />
        <span className="text-xs text-gray-500">PDF, PNG, JPG</span>
      </div>

      {errMessage && (
        <div className="mt-2 text-sm text-red-600">{errMessage}</div>
      )}
    </div>
  );
}

