import {
  ResourceResponseDto,
  ResourceState,
  TagResponseDto,
} from '@endo4life/data-access';
import { BaseEntity } from '@endo4life/types';

export interface IVideoEntity extends BaseEntity<ResourceResponseDto> {
  id: string;
  title?: string;
  description?: string;
  state?: ResourceState;
  resourceUrl?: string;
  thumbnailUrl?: string;
  size?: string;
  extension?: string;
  dimension?: string;
  commentCount?: number;
  viewNumber?: number;
  time?: number;
  createdAt?: string;
  updatedAt?: string;
  tag?: string[];
  detailTag?: string[];
}

export interface ITagOfVideoEntity extends BaseEntity<TagResponseDto> {
  id: string;
  content?: string;
}
