import { ResourceState } from '@endo4life/data-access';
import { BaseEntity } from '@endo4life/types';

export interface IResourceEntity extends BaseEntity {
  id: string;
  title?: string;
  description?: string;
  state?: ResourceState;
  type?: string;
  resourceUrl?: string;
  thumbnailUrl?: string;
  tag?: string[];
  detailTag?: string[];
  endoscopyTag?: string[];
  lightTag?: string[];
  hpTag?: string[];
  locationUpperTag?: string[];
  size?: string;
  extension?: string;
  dimension?: string;
  commentCount?: number;
  viewNumber?: number;
  time?: number; // for ResourceType.Video
}
