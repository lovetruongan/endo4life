import { TagResponseDto } from '@endo4life/data-access';
import { BaseEntity } from '@endo4life/types';

export interface ITagEntity extends BaseEntity<TagResponseDto> {
  id: string;
  content: string;
  children?: ITagEntity[];
}
