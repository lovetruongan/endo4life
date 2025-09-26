import { IImageUploadableFormData, IMediaGalleryItem, IVideoUploadableFormData } from "@endo4life/types";
import { stringUtils } from "@endo4life/util-common";

function fromFetchedAttachment(attachment: string): IMediaGalleryItem {
  return {
    src: attachment,
    thumb: attachment,
  } as IMediaGalleryItem;
}

function fromFetchedAttachments(attachments: string[]): IMediaGalleryItem[] {
  return attachments.map((attachment, index) => ({
    ...fromFetchedAttachment(attachment),
    id: index,
  }));
}

function fromInputAttachment(attachment: IImageUploadableFormData | IVideoUploadableFormData): IMediaGalleryItem {
  return {
    id: stringUtils.defaultString(attachment.id),
    src: stringUtils.defaultString(attachment.src),
    thumb: stringUtils.defaultString(attachment.src),
    alt: attachment.fileName,
  }
}

function fromInputAttachments(attachments: (IImageUploadableFormData | IVideoUploadableFormData)[]): IMediaGalleryItem[] {
  return attachments.map((attachment, index) => ({
    ...fromInputAttachment(attachment),
    id: index,
  }));
}

export const mediaGalleryUtils = {
  fromFetchedAttachment,
  fromFetchedAttachments,
  fromInputAttachment,
  fromInputAttachments,
}