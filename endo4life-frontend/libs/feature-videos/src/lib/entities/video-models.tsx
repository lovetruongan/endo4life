import {
  ResourceState,
  ResourceType,
} from '@endo4life/data-access';

export interface VideoEntity {
  id: string;
  title: string;
  description: string;
  state: ResourceState;
  resourceType: ResourceType;
  resourceUrl: string;
  thumbnailUrl: string;
  resourceSize: string;
  dimension: string;
  commentCount: number;
  viewNumber: number;
  createdAt?: Date;
  tags: string;
  detail_tags: string[];
}

export interface VideoDetailEntity extends VideoEntity {}
