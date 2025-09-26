import { Area } from 'react-easy-crop';

export async function getCroppedVideo(
  videoSrc: string,
  croppedAreaPixels: Area,
  originalFile: File,
  cropShape: 'rect' | 'round'
): Promise<File | null> {
  return new Promise<File | null>(async (resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.crossOrigin = 'anonymous';

      await new Promise((res, rej) => {
        video.onloadedmetadata = () => res(null);
        video.onerror = rej;
      });

      const originalWidth = video.videoWidth;
      const originalHeight = video.videoHeight;

      const canvas = document.createElement('canvas');
      canvas.width = originalWidth;
      canvas.height = originalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject('Failed to get canvas context');
        return;
      }

      if (cropShape === 'round') {
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          Math.min(canvas.width, canvas.height) / 2,
          0,
          2 * Math.PI
        );
        ctx.clip();
      }

      const stream = canvas.captureStream();

      const mimeType = MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const croppedFile = new File([blob], originalFile.name, {
          type: blob.type,
        });
        resolve(croppedFile);
      };

      mediaRecorder.start();

      // Draw video frames onto canvas
      const drawFrame = () => {
        if (video.paused || video.ended) {
          mediaRecorder.stop();
          return;
        }

        // Draw the cropped area onto the canvas, scaling it to fill the canvas
        ctx.drawImage(
          video,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        requestAnimationFrame(drawFrame);
      };

      video.play(); // Start video playback to draw frames
      drawFrame();
    } catch (error) {
      console.error('Error cropping video:', error);
      reject(error);
    }
  });
}
