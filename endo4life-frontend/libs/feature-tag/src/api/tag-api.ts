import { ITagEntity } from '../types';
import { BaseApi, CreateTagRequestDto, TagV1Api, TagType } from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import { TagMapper } from '../types/tag-mapper';

export interface ITagApi {
  getTags(parentTag: string[]): Promise<ITagEntity[]>;
  getAllTags(): Promise<ITagEntity[]>;
  getTagsByType(type: TagType): Promise<ITagEntity[]>;
  createTag(request: CreateTagRequestDto): Promise<void>;
  deleteTag(tagIds?: string[], tagDetailIds?: string[]): Promise<void>;
}

export class TagApiImpl extends BaseApi implements ITagApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  async getTags(parentTags: string[]): Promise<ITagEntity[]> {
    const config = await this.getApiConfiguration();
    const api = new TagV1Api(config);
    const response = await api.getTags({ parentTag: parentTags });
    const tagMapper = new TagMapper();
    return response.data.map((dto) => tagMapper.fromDto(dto));
  }

  async getAllTags(): Promise<ITagEntity[]> {
    const results: ITagEntity[] = [];
    const allTags = await this.getTags([]);
    for (const tag of allTags) {
      const children = await this.getTags([tag.id]);
      results.push({
        ...tag,
        children: children.map((item) => {
          return {
            ...item,
            parent: tag,
          };
        }),
      });
    }
    return results;
  }

  async getTagsByType(type: TagType): Promise<ITagEntity[]> {
    const config = await this.getApiConfiguration();
    const api = new TagV1Api(config);
    const response = await api.getTags({ type });
    const tagMapper = new TagMapper();
    const parentTags = response.data.map((dto) => tagMapper.fromDto(dto));

    // For DAMAGE_TAG, fetch children for each parent tag
    if (type === TagType.DamageTag) {
      const results: ITagEntity[] = [];
      for (const tag of parentTags) {
        const childrenResponse = await api.getTags({ parentTag: [tag.id] });
        const children = childrenResponse.data.map((dto) => {
          const child = tagMapper.fromDto(dto);
          return {
            ...child,
            parent: tag,
          };
        });
        results.push({
          ...tag,
          children,
        });
      }
      return results;
    }

    return parentTags;
  }

  async createTag(request: CreateTagRequestDto): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new TagV1Api(config);
    await api.createTag({ createTagRequestDto: request });
  }

  async deleteTag(tagIds?: string[], tagDetailIds?: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new TagV1Api(config);
    await api.deleteTag({ tagIds, tagDetailIds });
  }
}
