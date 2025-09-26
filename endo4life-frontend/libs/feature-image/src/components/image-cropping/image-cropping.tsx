import React, { useMemo, useRef, useState } from 'react';
import ReactCrop, { PixelCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  canvasToFile,
  drawImageOnCanvas,
  drawImageOnCanvasWithCurvedCorner,
} from '../../utils';
import { useTranslation } from 'react-i18next';

interface ICompleteCropProps {
  width: number;
  height: number;
}

interface Props {
  src: string;
  fileName: string;
  cropForm?: 'square' | 'circle' | 'oval';
  onCropFileChange?: (file: File) => void;
}

export function ImageCropping({
  src,
  fileName,
  cropForm = 'square',
  onCropFileChange,
}: Props) {
  const { t } = useTranslation('image');
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [completedCrop, setCompletedCrop] = useState<ICompleteCropProps>(
    {} as ICompleteCropProps,
  );
  const [crop, setCrop] = useState<Crop>();

  const isCircularCrop = useMemo(() => {
    return cropForm === 'circle' || cropForm === 'oval';
  }, [cropForm]);

  const handleChangeCrop = (crop: PixelCrop) => {
    setCrop(crop);
  };

  const handleReleaseCrop = async (crop: PixelCrop) => {
    if (imgRef.current && canvasRef.current) {
      cropForm === 'square'
        ? drawImageOnCanvas(imgRef.current, canvasRef.current, crop)
        : drawImageOnCanvasWithCurvedCorner(
            imgRef.current,
            canvasRef.current,
            crop,
          );
      setCompletedCrop(crop);
      const croppedFile = await canvasToFile(canvasRef, fileName);
      onCropFileChange && croppedFile && onCropFileChange(croppedFile);
    }
  };

  return (
    <div>
      <ReactCrop
        crop={crop}
        // disabled={!srcUrl && !srcFile}
        aspect={cropForm === 'circle' ? 1 / 1 : undefined}
        circularCrop={isCircularCrop}
        onChange={handleChangeCrop}
        onComplete={handleReleaseCrop}
      >
        <img
          alt="image-cropping"
          className="rounded-lg"
          crossOrigin="anonymous"
          ref={imgRef}
          src={src}
          title="image-crop"
        />
      </ReactCrop>
      {/* Canvas to display cropped image */}
      <div className="flex flex-col">
        <label className="py-1">{t('imageCropping.preview')}:</label>
        <canvas
          className="rounded-lg"
          ref={canvasRef}
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0),
          }}
        />
      </div>
    </div>
  );
}
