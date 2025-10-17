import { ITagEntity } from '../types';
import { BaseApi, TagV1Api } from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import { TagMapper } from '../types/tag-mapper';

export interface ITagApi {
  getTags(parentTag: string[]): Promise<ITagEntity[]>;
  getAllTags(): Promise<ITagEntity[]>;
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
}
