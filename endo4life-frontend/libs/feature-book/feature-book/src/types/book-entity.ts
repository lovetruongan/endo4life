export interface IBookEntity {
  id: string;
  title: string;
  description?: string;
  path: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  resourceUrl?: string;
  type: ResourceType;
  state: ResourceState;
  extension?: string;
  size?: string;
  viewNumber: number;
  commentCount: number;
  createdBy: string;
  createdByInfo?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  tag?: string[];
  detailTag?: string[];
  // Book-specific fields
  author?: string;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
}

export enum ResourceType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AVATAR = 'AVATAR',
  THUMBNAIL = 'THUMBNAIL',
  BOOK = 'BOOK',
  OTHER = 'OTHER',
  PROCESS = 'PROCESS'
}

export enum ResourceState {
  DRAFT = 'DRAFT',
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  UNLISTED = 'UNLISTED'
}

export interface ICreateBookRequest {
  title: string;
  description?: string;
  state: ResourceState;
  tag?: string[];
  detailTag?: string[];
  file: File;
  thumbnail?: File;
  // Book-specific fields
  author?: string;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
}

export interface IUpdateBookRequest {
  title?: string;
  description?: string;
  state?: ResourceState;
  tag?: string[];
  detailTag?: string[];
  // Book-specific fields
  author?: string;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
}

