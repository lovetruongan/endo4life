import imageCompression from 'browser-image-compression';

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
export const passwordAllowEmptyRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}|^$/;

export const phoneRegex =
  /^(\+?\d{1,4}[-.\s]?)?(\(?\d{1,3}\)?[-.\s]?)?(\d{1,4}[-.\s]?){2,3}$/;

export const compressAvatar = async (file: File) => {
  return imageCompression(file, {
    useWebWorker: true,
    maxSizeMB: 0.4,
    maxWidthOrHeight: 640,
  });
};
