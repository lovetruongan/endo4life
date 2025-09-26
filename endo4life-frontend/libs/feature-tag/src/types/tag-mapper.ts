import { TagResponseDto } from '@endo4life/data-access';
import { ITagEntity } from './tag-entity';
import { IOption } from '@endo4life/types';
import { ITagFormData } from './tag-form-data';

export interface ITagMapper {
  fromDto(dto: TagResponseDto): ITagEntity;
  toFormData(entity: ITagEntity): ITagFormData;
  toOption(entity: ITagEntity): IOption<ITagEntity>;
  toParentTag(option: IOption<ITagEntity>): string;
  toParentTags(options: IOption<ITagEntity>[]): string[];
}

export class TagMapper implements ITagMapper {
  toFormData(entity: ITagEntity): ITagFormData {
    return {
      id: entity.id,
      content: entity.content,
      metadata: entity,
    };
  }
  toOption(entity: ITagEntity): IOption<ITagEntity> {
    return {
      label: entity.content,
      value: entity.content,
      children: entity.children?.map((item) => {
        return {
          label: item.content,
          value: item.content,
          metadata: item,
        };
      }),
      metadata: entity,
    };
  }
  fromDto(dto: TagResponseDto): ITagEntity {
    return {
      id: dto.id || '',
      content: dto.content || '',
    };
  }
  toParentTag(option: IOption<ITagEntity>): string {
    return option.value || '';
  }
  toParentTags(options: IOption<ITagEntity>[]): string[] {
    return options.map((opt) => this.toParentTag(opt));
  }
}
