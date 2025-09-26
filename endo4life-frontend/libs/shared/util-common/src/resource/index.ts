import {
  IImageUploadableEntity,
  IVideoUploadableEntity,
} from '@endo4life/types';
import { isLocalUuid } from '../uuid';

export function getObjectKeyFromSignedUrl(presignedUrl: string) {
  const url = new URL(presignedUrl);
  const path = url.pathname;
  return path.substring(path.lastIndexOf('/') + 1, path.length);
}

export function urlToUploadableImageEntity(
  url?: string,
): IImageUploadableEntity | undefined {
  if (!url) return undefined;
  return {
    id: getObjectKeyFromSignedUrl(url),
    src: url,
  };
}

export function urlToUploadableVideoEntity(
  url?: string,
): IVideoUploadableEntity | undefined {
  if (!url) return undefined;
  return {
    id: getObjectKeyFromSignedUrl(url),
    src: url,
  };
}

export function toResourceObjectKey(id?: string) {
  if (id && !isLocalUuid(id)) return id;
  return undefined;
}
