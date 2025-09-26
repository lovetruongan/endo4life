import React, {
  ChangeEvent,
  ClipboardEventHandler,
  DragEvent,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { RxUpload } from 'react-icons/rx';
import { useTranslation } from 'react-i18next';
import { Button } from '@endo4life/ui-common';
import clsx from 'clsx';
import { VideoCropping } from '@endo4life/feature-videos';
import { isFileValid } from '@endo4life/util-common';

interface FormInputVideoProps {
  value?: File;
  label?: string;
  errMessage?: string;
  resourceUrl?: string;
  allowEdit?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  isCroppingVideo?: boolean;
  className?: string;
  onCropVideoClick?: (e: React.MouseEvent) => void;
  onChange: (selectedVideo: File) => void;
}

export function FormInputVideo({
  value,
  resourceUrl,
  fileInputRef,
  isCroppingVideo = false,
  onCropVideoClick,
  onChange,
  label,
  errMessage,
  className,
}: FormInputVideoProps) {
  const { t } = useTranslation(['common', 'video']);
  const [previewVisible, setPreviewVisible] = useState(!!resourceUrl);
  const [previewSource, setPreviewSource] = useState<string>('');
  const [, setShowPasteArea] = useState(!value);
  const [isDragging, setIsDragging] = useState(false);
  const [cropShape, setCropShape] = useState<'rect' | 'round'>('rect');
  const [croppedVideo, setCroppedFile] = useState<File>({} as File);
  const [cropAspect, setCropAspect] = useState<number>(4 / 3);

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
    [onChange, setPreviewSource, setPreviewVisible]
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
    [setIsDragging]
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
    ]
  );

  const handlePaste: ClipboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('video') && items[i].kind === 'file') {
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
    [onChange, setShowPasteArea]
  );

  const handleCropShapeChange = (cropForm: 'rect' | 'round' | 'oval') => {
    if (cropForm === 'oval') {
      setCropShape('round');
      setCropAspect(16 / 9);
    } else {
      setCropShape(cropForm);
      setCropAspect(4 / 3);
    }
  };

  const handleCroppingComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (croppedVideo) {
      onChange && onChange(croppedVideo);
      setPreviewSource(URL.createObjectURL(croppedVideo));
    }

    onCropVideoClick && onCropVideoClick(e);
  };

  const renderVideo = useMemo(() => {
    return isCroppingVideo ? (
      <div className="relative w-full h-auto">
        {value || resourceUrl ? (
          <VideoCropping
            // srcFile={value || resourceUrl}
            srcFile={
              isFileValid(value)
                ? URL.createObjectURL(value)
                : resourceUrl || ''
            }
            cropShape={cropShape}
            aspect={cropAspect}
            onCropFileChange={(file: File) => {
              setCroppedFile(file);
              onChange(file);
            }}
          />
        ) : (
          <p>{t('common:noFileSelected')}</p>
        )}
      </div>
    ) : (
      <video
        className="object-cover w-full h-auto rounded-lg"
        src={previewSource ? previewSource : resourceUrl}
        controls
      />
    );
  }, [
    t,
    isCroppingVideo,
    cropShape,
    value,
    previewSource,
    cropAspect,
    resourceUrl,
  ]);

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
            'justify-center': !isCroppingVideo,
          },
          className
        )}
        onPaste={handlePaste}
      >
        {previewVisible ? (
          <div className="flex justify-center">{renderVideo}</div>
        ) : (
          <div
            className="flex flex-col items-center gap-2"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Button
              variant="outline"
              text="Chọn video"
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
          title="inputvideo"
          ref={fileInputRef}
          multiple
          onChange={handleAttachmentChange}
          accept="video/*"
        />
      </div>
      {isCroppingVideo && (
        <div
          className={clsx({
            'grid grid-cols-1 md:flex justify-end mt-5 gap-2': true,
            hidden: !isCroppingVideo,
          })}
        >
          <Button className="" variant="outline" onClick={onCropVideoClick}>
            Hủy
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

export default FormInputVideo;
