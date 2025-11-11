import { Modal } from '@mui/material';
import { useCallback, useState, useEffect, useRef } from 'react';
import ReactCrop, { PixelCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { canvasToFile, drawImageOnCanvas } from '@endo4life/feature-image';
import { MdZoomIn, MdZoomOut, MdZoomOutMap } from 'react-icons/md';

interface Props {
  open: boolean;
  imageFile: File | null;
  imageSrc?: string;
  onClose(): void;
  onConfirm(croppedFile: File): void;
}

export function QuestionImageCropDialog({
  open,
  imageFile,
  imageSrc: externalImageSrc,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation(['common', 'image']);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [internalImageSrc, setInternalImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const previewUrlRef = useRef<string>('');

  // Use external imageSrc if provided, otherwise generate from file
  const imageSrc = externalImageSrc || internalImageSrc;
  
  // Debug logging
  useEffect(() => {
    if (open) {
      console.log('Dialog opened - imageSrc:', imageSrc, 'imageFile:', imageFile, 'externalImageSrc:', externalImageSrc, 'internalImageSrc:', internalImageSrc);
    }
  }, [open, imageSrc, imageFile, externalImageSrc, internalImageSrc]);

  // Generate image src from file when file changes
  useEffect(() => {
    if (open) {
      if (imageFile && !externalImageSrc) {
        // Create object URL from file
        const src = URL.createObjectURL(imageFile);
        setInternalImageSrc(src);
        // Reset states when new image loads
        setImageLoaded(false);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setCroppedFile(null);
        setZoom(1);
        return () => {
          URL.revokeObjectURL(src);
        };
      } else if (externalImageSrc) {
        // Use external image source
        setInternalImageSrc('');
        // Reset states when new image loads
        setImageLoaded(false);
        setCrop(undefined);
        setCompletedCrop(undefined);
        setCroppedFile(null);
        setZoom(1);
      }
    } else {
      // Cleanup when dialog closes
      setInternalImageSrc('');
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setCroppedFile(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = '';
      }
      setPreviewUrl('');
      setZoom(1);
      setImageLoaded(false);
    }
  }, [imageFile, open, externalImageSrc]);

  // Cleanup preview URL on unmount or when dialog closes
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = '';
      }
    };
  }, []);
  
  // Cleanup on dialog close
  useEffect(() => {
    if (!open) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = '';
        setPreviewUrl('');
      }
    }
  }, [open]);


  // Handle image load
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    console.log('Image loaded:', {
      src: imageSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      width: img.width,
      height: img.height,
      complete: img.complete
    });
    setImageLoaded(true);
    setZoom(1);
  }, [imageSrc]);


  // Handle crop change
  const handleCropChange = useCallback((crop: PixelCrop) => {
    setCrop(crop);
  }, []);

  // Update preview when crop changes
  useEffect(() => {
    if (completedCrop && imgRef.current && canvasRef.current && 
        completedCrop.width > 0 && completedCrop.height > 0) {
      
      // Define updatePreview function
      const updatePreview = () => {
        try {
          if (!imgRef.current || !canvasRef.current) {
            console.error('Refs not available');
            return;
          }
          
          const img = imgRef.current;
          const canvas = canvasRef.current;
          
          // Verify image is loaded
          if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
            console.error('Image not fully loaded', {
              complete: img.complete,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            return;
          }
          
          console.log('Updating preview with crop:', completedCrop, 'image size:', {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: img.width,
            displayHeight: img.height
          });
          
          // Draw cropped image to canvas
          try {
            drawImageOnCanvas(img, canvas, completedCrop);
          } catch (drawError) {
            console.error('Error drawing image to canvas (possibly CORS issue):', drawError);
            // If drawing fails due to CORS, try to create preview using a different method
            // For now, just log the error and return
            return;
          }
          
          // Cleanup old preview URL
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = '';
          }
          
          // Create preview URL from canvas
          try {
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                previewUrlRef.current = url;
                setPreviewUrl(url);
                console.log('Preview URL created:', url);
              } else {
                console.error('Failed to create blob from canvas - canvas may be tainted');
                // If canvas is tainted (CORS issue), try to show error or use alternative method
              }
            }, 'image/png', 0.95);
          } catch (blobError) {
            console.error('Error creating blob from canvas:', blobError);
          }
          
          // Create cropped file
          const fileName = imageFile?.name || 'question-image.jpg';
          canvasToFile(canvasRef, fileName).then((file) => {
            if (file) {
              setCroppedFile(file);
              console.log('Cropped file created:', file.name, file.size);
            }
          }).catch((error) => {
            console.error('Error creating cropped file:', error);
          });
        } catch (error) {
          console.error('Error updating preview:', error);
        }
      };
      
      // Check if image is fully loaded
      const img = imgRef.current;
      if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        console.log('Image not ready yet, waiting for load...', {
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: img.width,
          height: img.height
        });
        // Wait for image to load
        const handleImageLoad = () => {
          // Small delay to ensure image is fully rendered
          setTimeout(updatePreview, 100);
        };
        img.addEventListener('load', handleImageLoad, { once: true });
        return () => {
          img.removeEventListener('load', handleImageLoad);
        };
      }
      
      // Image is ready, update preview with small delay
      const timeoutId = setTimeout(updatePreview, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Cleanup preview URL when no crop
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = '';
        setPreviewUrl('');
      }
    }
  }, [completedCrop, imageFile, imageLoaded]);

  // Handle crop complete
  const handleCropComplete = useCallback((crop: PixelCrop) => {
    if (crop.width && crop.height && crop.width > 0 && crop.height > 0) {
      setCompletedCrop(crop);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    // If user has cropped, use cropped file, otherwise use original file
    const fileToUse = croppedFile || imageFile;
    if (fileToUse) {
      onConfirm(fileToUse);
      onClose();
    }
  }, [croppedFile, imageFile, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    setCroppedFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
    setPreviewUrl('');
    setZoom(1);
    onClose();
  }, [onClose]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  // Always render dialog if open, even without image (to show loading state)
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <section 
        className="w-full max-w-7xl bg-white rounded-lg shadow-lg flex flex-col"
        style={{ maxHeight: '90vh', height: '90vh' }}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Cắt ảnh cho câu hỏi
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>
        
        <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0" style={{ minHeight: 0 }}>
          {/* Left side - Crop Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ flex: '1.4' }}>
            <div className="mb-2 flex-shrink-0 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Kéo để chọn vùng ảnh bạn muốn cắt
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Thu nhỏ"
                >
                  <MdZoomOut size={20} />
                </button>
                <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Phóng to"
                >
                  <MdZoomIn size={20} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="Reset zoom"
                >
                  <MdZoomOutMap size={20} />
                </button>
              </div>
            </div>
            <div 
              ref={cropContainerRef}
              className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-auto min-h-0 relative"
              style={{ minHeight: 0 }}
            >
              {imageSrc ? (
                <div 
                  className="w-full h-full flex items-center justify-center p-4"
                  style={{ 
                    minHeight: '400px',
                  }}
                >
                  <div
                    className="relative"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: zoom === 1 ? 'none' : 'transform 0.2s ease-in-out',
                    }}
                  >
                    <ReactCrop
                      crop={crop}
                      onChange={handleCropChange}
                      onComplete={handleCropComplete}
                      className="react-crop"
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imageSrc}
                        onLoad={onImageLoad}
                        onError={(e) => {
                          console.error('Failed to load image:', imageSrc, e);
                          setImageLoaded(false);
                        }}
                        style={{
                          display: 'block',
                          maxWidth: '800px',
                          maxHeight: '600px',
                          width: 'auto',
                          height: 'auto',
                        }}
                      />
                    </ReactCrop>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <p className="text-sm text-gray-400">
                    {imageFile ? 'Đang tải ảnh...' : 'Không có ảnh để hiển thị'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="flex flex-col min-w-0 overflow-hidden flex-shrink-0" style={{ width: '380px', flexShrink: 0 }}>
            <div className="mb-2 flex-shrink-0">
              <p className="text-sm font-medium text-gray-700">Xem trước</p>
            </div>
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden p-4 min-h-0" style={{ minHeight: 0 }}>
              {previewUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full rounded-lg shadow-md"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <p className="text-sm text-center px-4">Chọn vùng ảnh để xem trước</p>
                </div>
              )}
              {/* Hidden canvas for drawing - ensure it's rendered */}
              <canvas
                ref={canvasRef}
                style={{ 
                  position: 'absolute',
                  top: '-9999px',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            text={t('common:txtCancel')}
            onClick={handleCancel}
            variant="outline"
            className="px-6"
          />
          <Button
            text={t('common:txtConfirm')}
            onClick={handleConfirm}
            variant="fill"
            className="px-6"
            disabled={!croppedFile && !imageFile}
          />
        </div>
      </section>
    </Modal>
  );
}

export default QuestionImageCropDialog;
