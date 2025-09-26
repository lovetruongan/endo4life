import {
  ResourceState,
  UploadType,
} from '@endo4life/data-access';
import { IVideoEntity } from './video-entity';

export interface IVideoFormMetadataData {
  title: string;
  description?: string;
  state?: ResourceState;
  tag?: string[];
  detailTag?: string[];
}

export interface IVideoCreateFormData {
  type: UploadType;
  files?: File[];
  metadata: IVideoFormMetadataData[];
  compressedFile?: File;
}

export interface IVideoUploadFormData {
  type: UploadType;
  file?: {
    title: string;
    description?: string;
    state?: ResourceState;
    tag?: string[];
    detailTag?: string[];
  }[];
  compressedFile?: File;
}

export interface IVideoUpdateFormData {
  id: string;
  metadata: IVideoFormMetadataData;
  file?: File;
  resourceUrl?: string;
  entity?: IVideoEntity;
}
