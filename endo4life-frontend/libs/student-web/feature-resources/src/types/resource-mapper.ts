import {
  UserResourceDetailResponseDto,
  UserResourceResponseDto,
} from '@endo4life/data-access';
import { IResourceEntity } from './resource-entity';

export interface IResourceMapper {
  fromDto(dto: UserResourceResponseDto): IResourceEntity;
}

export class ResourceMapper implements IResourceMapper {
  private static _instance: ResourceMapper | null = null;
  static getInstance(): ResourceMapper {
    if (!this._instance) {
      this._instance = new ResourceMapper();
    }
    return this._instance;
  }

  fromDto(dto: UserResourceResponseDto): IResourceEntity {
    if (!dto.id) throw new Error('Invalid Resource DTO');
    return {
      id: dto.id,
      title: dto.title,
      type: dto.type,
      thumbnailUrl: dto.thumbnailUrl,
      tag: dto.tag,
      detailTag: dto.detailTag,
      time: dto.time,
      createdAt: dto.createdAt,
      createdBy: dto.createdBy,
    };
  }

  fromDetailDto(dto: UserResourceDetailResponseDto): IResourceEntity {
    if (!dto.id) throw new Error('Invalid Resource DTO');
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      resourceUrl: dto.resourceUrl,
      tag: dto.tag,
      detailTag: dto.detailTag,
      anatomyLocationTag: dto.anatomyLocationTag,
      lightTag: dto.lightTag,
      hpTag: dto.hpTag,
      upperGastroAnatomyTag: dto.upperGastroAnatomyTag,
      extension: dto.extension,
      dimension: dto.dimension,
      time: dto.time,
      createdAt: dto.createdAt,
      createdBy: dto.createdBy,
    };
  }
}