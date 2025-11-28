import {
  ResourceState,
  UploadType,
} from '@endo4life/data-access';
import { IImageEntity } from './image-entity';

export interface IImageFormMetadataData {
  title: string;
  description?: string;
  state?: ResourceState;
  tag?: string[];
  detailTag?: string[];
  anatomyLocationTag?: string[];
  hpTag?: string[];
  lightTag?: string[];
  upperGastroAnatomyTag?: string[];
}

export interface IImageCreateFormData {
  type: UploadType;
  files?: File[];
  metadata: IImageFormMetadataData[];
  compressedFile?: File;
}

export interface IImageUploadFormData {
  type: UploadType;
  file?: {
    title: string;
    description?: string;
    state?: ResourceState;
    tag?: string[];
    detailTag?: string[];
    anatomyLocationTag?: string[];
    hpTag?: string[];
    lightTag?: string[];
    upperGastroAnatomyTag?: string[];
  }[];
  compressedFile?: File;
}

export interface IImageUpdateFormData {
  id: string;
  metadata: IImageFormMetadataData;
  file?: File;
  resourceUrl?: string;
  entity?: IImageEntity;
}
