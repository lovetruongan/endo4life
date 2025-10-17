import { useState, useEffect, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedVideo } from '../../utils';
import { Button } from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';

interface VideoCroppingProps {
  srcFile: File | string;
  cropShape: 'rect' | 'round';
  aspect?: number;
  onCropFileChange?: (file: File) => void;
}

export function VideoCropping({
  srcFile,
  cropShape,
  aspect = 1,
  onCropFileChange,
}: VideoCroppingProps) {
  const { t } = useTranslation('video');
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [videoAspect, setVideoAspect] = useState<number>(aspect);
  const [croppedVideoURL, setCroppedVideoURL] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleCropVideo = async () => {
    if (videoURL && croppedAreaPixels && originalFile) {
      setProcessing(true);
      try {
        const croppedFile = await getCroppedVideo(
          videoURL,
          croppedAreaPixels,
          originalFile,
          cropShape,
        );
        if (croppedFile) {
          if (onCropFileChange) {
            onCropFileChange(croppedFile);
          }

          const croppedURL = URL.createObjectURL(croppedFile);
          setCroppedVideoURL(croppedURL);
        }
      } catch (error) {
        console.error('Error cropping video:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  useEffect(() => {
    const loadVideo = async () => {
      let objectURL: string;
      let isMounted = true;

      if (srcFile) {
        let file: File;

        if (typeof srcFile === 'string') {
          try {
            const response = await fetch(srcFile);
            const blob = await response.blob();
            file = new File([blob], 'video.mp4', { type: blob.type });
            objectURL = URL.createObjectURL(file);
          } catch (error) {
            console.error('Error fetching video:', error);
            return;
          }
        } else {
          file = srcFile;
          objectURL = URL.createObjectURL(file);
        }

        if (!isMounted) {
          return;
        }

        setOriginalFile(file);
        setVideoURL(objectURL);

        const videoElement = document.createElement('video');
        videoElement.src = objectURL;
        videoElement.onloadedmetadata = () => {
          const aspectRatio =
            videoElement.videoWidth / videoElement.videoHeight;
          setVideoAspect(aspectRatio);
        };

        return () => {
          isMounted = false;
          if (objectURL) {
            URL.revokeObjectURL(objectURL);
          }
        };
      }
    };

    loadVideo();
  }, [srcFile]);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

  return (
    <div>
      {videoURL ? (
        <div className="relative w-full h-64">
          <div
            className="crop-container"
            style={{
              width: '100%',
              height: '100%',
              aspectRatio: aspect,
            }}
          >
            <Cropper
              video={videoURL}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              mediaProps={{
                controls: true,
                autoPlay: true,
                muted: false,
                preload: 'auto',
              }}
            />
          </div>
        </div>
      ) : (
        <p>{t('videoCropping.loadingCropFrame')}</p>
      )}

      {processing && <p>{t('videoCropping.processing')}</p>}

      {!processing && croppedVideoURL && (
        <div className="w-full mt-4">
          <label className="py-1">{t('videoCropping.preview')}:</label>
          <video
            className="object-cover w-full h-auto rounded-lg"
            src={croppedVideoURL}
            controls
          />
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleCropVideo}
          requesting={processing}
          disabled={processing}
          variant="fill"
          text={t('videoCropping.createCrop')}
        />
      </div>
    </div>
  );
}

export default VideoCropping;
