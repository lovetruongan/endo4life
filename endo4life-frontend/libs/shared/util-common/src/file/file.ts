export const getFileExtension = (
  file: File,
  isUpperCase: boolean = true
): string => {
  return file?.name?.split('.')?.pop()?.toUpperCase() || '';
};

export const getFileExtensionFromUrl = (
  url: string,
  baseUrl: string,
  bucket: string,
  isUpperCase: boolean = true
): string => {
  return (
    extractFileNameFromPresignedLink(url, baseUrl, 'images')
      .split('.')[1]
      .toUpperCase() || '_'
  );
};

export const getFileSize = (file: File): number => {
  return file?.size;
};

export const isFileValid = (file: File | null | undefined): boolean => {
  return file !== null && file !== undefined && file.size > 0;
};

export const getFileFormat = (
  baseUrl: string,
  selectedFile: File | undefined,
  formData: any
): string => {
  if (isFileValid(selectedFile)) {
    return getFileExtension(selectedFile!);
  }
  return getFileExtensionFromUrl(
    formData?.resourceUrl || '',
    baseUrl,
    'images'
  );
};

export const getFileSizeFormatted = (
  selectedFile: File | undefined,
  formData: any
): string => {
  if (!isFileValid(selectedFile)) {
    const size = formData?.entity?.size?.split(' ');
    return Number(+size[0]!).toFixed(3) + ' ' + size[1];
  }
  return formatFileSize(getFileSize(selectedFile!));
};

export const formatFileSize = (
  bytes: number,
  decimalPoint: number = 2
): string => {
  if (!bytes) return '0 B';
  const k = 1000,
    dm = decimalPoint || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + (sizes[i] || ' ')
  );
};

export const getImageDimensions = async (file: File) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Unable to load image'));
  });

  return `${img.width} x ${img.height}`;
};

export const getVideoDimensions = async (file: File) => {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);

  await new Promise((resolve, reject) => {
    video.onloadedmetadata = () => resolve(null);
    video.onerror = () => reject(new Error('Unable to load video'));
  });

  return `${video.videoWidth} x ${video.videoHeight}`;
};

export const getResourceType = (
  type: File | string
): 'jpeg' | 'pdf' | 'hyperlink' => {
  if (type === 'hyperlink' || type === 'pdf') {
    return type;
  }

  if (type === 'application/pdf') {
    return 'pdf';
  }

  return 'jpeg';
};

export const inferTypeFromUrl = (url: string) => {
  if (url.match(/\.(jpeg|jpg|gif|png|svg)(\?|#|$)/i)) {
    return 'image';
  }
  if (url.match(/\.(mp4|webm|ogv)(\?|#|$)/i)) {
    return 'video';
  }
  if (url.match(/\.pdf(\?|#|$)/i)) {
    return 'application/pdf';
  }
  // Default to image if unable to infer
  return 'image';
};

export const extractFileNameFromPresignedLink = (
  fileUrl: string,
  baseUrl: string,
  bucket: string
) => {
  const bucketUrl = baseUrl + '/' + bucket + '/';
  return fileUrl.substring(
    fileUrl.indexOf(bucketUrl) + bucketUrl.length,
    fileUrl.indexOf('?')
  );
};

export const resourceUrlToFile = async (
  imageUrl: string,
  fileName: string,
  mimeType: string = 'image/*'
) => {
  // or video/*
  if (!imageUrl) {
    return {} as File;
  }
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: mimeType });
  return file;
};
