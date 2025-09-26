import {
  ResourceCriteria,
  ResourceState,
  ResourceType,
} from '@endo4life/data-access';
import { BaseFilter, IFilter } from '@endo4life/types';

export enum ResourceTypeEnum {
  'IMAGE' = 'IMAGE',
  'VIDEO' = 'VIDEO',
  'COURSE' = 'COURSE',
}

export interface IResourceFilter extends IFilter {
  resourceType?: 'IMAGE' | 'VIDEO' | 'COURSE';
}

export class ResourceFilter extends BaseFilter implements IResourceFilter {
  toCriteria(): ResourceCriteria {
    const data: ResourceCriteria = {
      ids: this.getArrayStringField('ids'),
      title: this.getStringField('title'),
      state: this.getStringField('state') as ResourceState,
      resourceType: this.getStringField('resourceType') as ResourceType,
      fromDate: this.getStringField('fromDate'),
      toDate: this.getStringField('toDate'),
      tag: this.getArrayStringField('tag'),
      detailTag: this.getArrayStringField('detailTag'),
      endoscopyTag: this.getArrayStringField('endoscopyTag'),
      lightTag: this.getArrayStringField('lightTag'),
      hpTag: this.getArrayStringField('hpTag'),
      locationUpperTag: this.getArrayStringField('locationUpperTag'),
      searchWords: this.getSearch(),
    };

    const commentOperator = this.getStringField('commentOperator');
    const viewOperator = this.getStringField('viewOperator');
    const numComments = this.getNumberField('numComments');
    const numViews = this.getNumberField('numViews');

    if (commentOperator === '<=' && numComments) {
      data['commentCountTo'] = numComments;
    }
    if (commentOperator === '>=' && numComments) {
      data['commentCountFrom'] = numComments;
    }

    if (viewOperator === '<=' && numViews) {
      data['viewNumberTo'] = numViews;
    }
    if (viewOperator === '>=' && numViews) {
      data['viewNumberFrom'] = numViews;
    }

    for (const key of Object.keys(data)) {
      if (data[key as keyof ResourceCriteria] === undefined) {
        delete data[key as keyof ResourceCriteria];
      }
    }
    return data;
  }

  getType() {
    return this.getStringField('resourceType');
  }

  setType(type?: 'IMAGE' | 'VIDEO' | 'COURSE') {
    this.setQuery('resourceType', type);
  }
}
