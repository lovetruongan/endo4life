import { PixelCrop } from 'react-image-crop';

export function generateDownload(canvas: HTMLCanvasElement, crop: PixelCrop) {
  if (!crop || !canvas) {
    return;
  }

  canvas.toBlob(
    (blob) => {
      const previewUrl = window.URL.createObjectURL(blob!);

      const anchor = document.createElement('a');
      anchor.download = 'cropPreview.png';
      anchor.href = URL.createObjectURL(blob!);
      anchor.click();

      window.URL.revokeObjectURL(previewUrl);
    },
    'image/png',
    1
  );
}

export function drawImageOnCanvas(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) {
  if (!crop || !canvas || !image) {
    return;
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const ctx = canvas.getContext('2d');
  // refer https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
  const pixelRatio = window.devicePixelRatio;

  canvas.width = crop.width * pixelRatio * scaleX;
  canvas.height = crop.height * pixelRatio * scaleY;

  if (!ctx) {
    console.log('ctx is not available');
    return;
  }

  // refer https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  // refer https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );
}

export function drawImageOnCanvasWithCurvedCorner(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  borderRadius: number = 100,
) {
  if (!crop || !canvas || !image) {
    return;
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const ctx = canvas.getContext('2d');
  const pixelRatio = window.devicePixelRatio;

  canvas.width = crop.width * pixelRatio * scaleX;
  canvas.height = crop.height * pixelRatio * scaleY;

  if (!ctx) {
    console.log("ctx is not available");
    return;
  }

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  // Calculate the actual border radius in pixels
  const radiusX = (crop.width * scaleX * borderRadius) / 100 / 2;
  const radiusY = (crop.height * scaleY * borderRadius) / 100 / 2;

  // Create a rounded rectangle path
  ctx.beginPath();
  ctx.moveTo(radiusX, 0);
  ctx.lineTo(crop.width * scaleX - radiusX, 0);
  ctx.quadraticCurveTo(crop.width * scaleX, 0, crop.width * scaleX, radiusY);
  ctx.lineTo(crop.width * scaleX, crop.height * scaleY - radiusY);
  ctx.quadraticCurveTo(crop.width * scaleX, crop.height * scaleY, crop.width * scaleX - radiusX, crop.height * scaleY);
  ctx.lineTo(radiusX, crop.height * scaleY);
  ctx.quadraticCurveTo(0, crop.height * scaleY, 0, crop.height * scaleY - radiusY);
  ctx.lineTo(0, radiusY);
  ctx.quadraticCurveTo(0, 0, radiusX, 0);
  ctx.closePath();

  // Clip the drawing area to the rounded rectangle
  ctx.clip();

  // Draw the image
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );
}

export function canvasToFile(canvasRef: React.RefObject<HTMLCanvasElement>, fileName: string): Promise<File | null> {
  return new Promise((resolve, reject) => {
    if (!canvasRef.current) {
      return reject(new Error('Canvas not found'));
    }

    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        return resolve(null);
      }

      const croppedImageFile = new File([blob], fileName, { type: 'image/*' });
      resolve(croppedImageFile);
    }, 'image/*');
  });
}
