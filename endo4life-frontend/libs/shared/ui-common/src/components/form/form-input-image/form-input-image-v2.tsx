import React, {
  ChangeEvent,
  ClipboardEventHandler,
  DragEvent,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { RxUpload } from 'react-icons/rx';
import clsx from 'clsx';
import { ImageCropping } from '@endo4life/feature-image';
import {
  extractFileNameFromPresignedLink,
  isFileValid,
} from '@endo4life/util-common';
import { EnvConfig } from '@endo4life/feature-config';
import { Button } from '../../button/button';

interface FormInputImageProps {
  value?: File;
  resourceUrl?: string;
  label?: string;
  errMessage?: string;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  isCropping?: boolean;
  className?: string;
  onCropImageClick?: (e: React.MouseEvent) => void;
  onChange: (selectedImage: File) => void;
}

export function FormInputImageV2({
  value,
  resourceUrl,
  fileInputRef,
  isCropping = false,
  onCropImageClick,
  onChange,
  label,
  errMessage,
  className,
}: FormInputImageProps) {
  const [previewVisible, setPreviewVisible] = useState(!!resourceUrl);
  const [previewSource, setPreviewSource] = useState<string>('');
  const [, setShowPasteArea] = useState(!value);
  const [isDragging, setIsDragging] = useState(false);
  const [cropForm, setCropForm] = useState<'square' | 'circle' | 'oval'>(
    'square',
  );
  const [croppedImage, setCroppingFile] = useState<File>({} as File);

  const handleAttachmentChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setPreviewSource(reader.result);
          }
        };
        reader.readAsDataURL(file);
        setPreviewVisible(true);
        onChange(file);
      }
    },
    [onChange, setPreviewSource, setPreviewVisible],
  );

  const handleDragOver = useCallback((event: DragEvent<Element>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(
    (event: DragEvent<Element>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    [setIsDragging],
  );

  const handleDrop = useCallback(
    (event: DragEvent<Element>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setPreviewSource(reader.result);
          }
        };
        reader.readAsDataURL(file);
        setShowPasteArea(false);
        setPreviewVisible(true);
        onChange(file);
      }
    },
    [
      onChange,
      setIsDragging,
      setShowPasteArea,
      setPreviewVisible,
      setPreviewSource,
    ],
  );

  const handlePaste: ClipboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image') && items[i].kind === 'file') {
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  setPreviewSource(reader.result);
                }
              };
              reader.readAsDataURL(file);
              setShowPasteArea(false);
              setPreviewVisible(true);
              onChange(file);
              break;
            }
          }
        }
      }
    },
    [onChange, setShowPasteArea],
  );

  const handleCropFormChange = (cropForm: 'square' | 'circle' | 'oval') => {
    setCropForm(cropForm);
  };

  const handleCroppingComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange && onChange(croppedImage);
    setPreviewSource(URL.createObjectURL(croppedImage));

    onCropImageClick && onCropImageClick(e);
  };

  const renderThumbnail = useMemo(() => {
    return isCropping && value ? (
      <div>
        <ImageCropping
          src={
            isFileValid(value) ? URL.createObjectURL(value) : resourceUrl || ''
          }
          fileName={
            isFileValid(value)
              ? value.name
              : extractFileNameFromPresignedLink(
                  resourceUrl || '',
                  EnvConfig.Endo4LifeServiceUrl,
                  'images',
                )
          }
          cropForm={cropForm}
          onCropFileChange={(file: File) => setCroppingFile(file)}
        />
      </div>
    ) : (
      <img
        className="rounded-lg object-fit"
        src={previewSource ? previewSource : resourceUrl}
        alt="thumbnail"
      />
    );
  }, [isCropping, cropForm, value, previewSource, onChange, resourceUrl]);

  return (
    <div className="justify-center w-full">
      {label && (
        <div className="gap-1 mb-2">
          <h3 className="text-sm font-medium">{label}</h3>
        </div>
      )}
      <div
        className={clsx(
          {
            'gap-2 flex flex-col border-2 border-dashed p-6 text-gray-700 rounded-lg':
              true,
            'border-neutral-primary border-[#2c224c] bg-primary-light-1':
              isDragging,
            'border-background-300 bg-neutral-background-layer-1': !isDragging,
            'justify-center': !isCropping,
          },
          className,
        )}
        onPaste={handlePaste}
      >
        {previewVisible ? (
          <div className="flex justify-center">{renderThumbnail}</div>
        ) : (
          <div
            className="flex flex-col items-center gap-2"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Button
              variant="outline"
              text="Chọn ảnh"
              textClassName="hidden lg:block"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                fileInputRef?.current?.click();
              }}
              className="px-4 py-2 transition-colors duration-300 ease-in-out transform text-neutral-text border-slate-300 hover:bg-primary-hover hover:text-white"
            >
              <RxUpload />
            </Button>
            <span className="mx-2 text-sm text-center text-gray-500">
              hoặc kéo thả vào đây
            </span>
          </div>
        )}
        <input
          className="hidden"
          type="file"
          title="inputimage"
          ref={fileInputRef}
          multiple
          onChange={handleAttachmentChange}
          accept="image/*"
        />
      </div>
      {isCropping && (
        <div
          className={clsx({
            'grid grid-cols-1 md:flex justify-end mt-5 gap-2': true,
            hidden: !isCropping,
          })}
        >
          <Button className="" variant="outline" onClick={onCropImageClick}>
            Huỷ
          </Button>
          <Button
            className="text-nowrap"
            variant="fill"
            text="Hoàn thành"
            onClick={handleCroppingComplete}
          />
        </div>
      )}
      {errMessage && <div className="text-sm text-red-500">{errMessage}</div>}
    </div>
  );
}

export default FormInputImageV2;
