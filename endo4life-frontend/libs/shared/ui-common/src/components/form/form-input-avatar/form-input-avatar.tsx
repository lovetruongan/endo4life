import React, { useState, useEffect } from 'react';
import styles from './form-avatar.module.css';
import { Avatar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { CiCamera } from 'react-icons/ci';
import { compressAvatar } from '@endo4life/feature-user';

export interface FormInputAvatarProps {
  label?: string;
  isRequired?: boolean;
  value?: File | null;
  onChange?: (file: File) => void;
  errMessage?: string;
  className?: string;
  avatarLink?: string;
}

export function FormInputAvatar({
  label,
  isRequired,
  value,
  onChange,
  errMessage,
  className,
  avatarLink,
}: FormInputAvatarProps) {
  const { t } = useTranslation('user');
  const [preview, setPreview] = useState<string>('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image')) {
      const compressed = await compressAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreview(reader.result);
        }
      };
      reader.readAsDataURL(compressed);
      onChange && onChange(compressed);
    } else {
      toast.error(t('basicInfo.invalidAvatarImage'));
    }
  };

  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        setPreview(value);
      } else if (value instanceof File || Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setPreview(reader.result);
          }
        };
        reader.readAsDataURL(value);
      }
    } else {
      setPreview('');
    }
  }, [value]);

  return (
    <div className={`avatarContainer ${className}`}>
      {label && (
        <div className={styles.label}>
          <h3 className={styles.labelText}>{label}</h3>
          {isRequired && <span>*</span>}
        </div>
      )}
      <div className="flex items-center gap-4">
        <Avatar
          className="avatar"
          alt="Avatar"
          sx={{
            width: '52px',
            height: '52px',
            borderWidth: '1px',
            borderColor: '#d1d5db',
          }}
          src={preview ? preview : avatarLink}
        />
        <label
          htmlFor="avatar-upload"
          className="relative px-3 py-2 border rounded-lg cursor-pointer btn btn-primary"
        >
          <CiCamera className="absolute text-2xl font-bold top-1/2 left-3 -translate-y-2/4" />
          <span className="ml-8 text-sm">
            {t('basicInfo.changeAvatarAction')}
          </span>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
      {errMessage && <div className="avatarErrorText">{errMessage}</div>}
    </div>
  );
}
