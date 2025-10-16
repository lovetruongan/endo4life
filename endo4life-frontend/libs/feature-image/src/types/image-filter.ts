import {
  ResourceCriteria,
  ResourceState,
  ResourceType,
} from '@endo4life/data-access';
import { BaseFilter, IFilter } from '@endo4life/types';

export interface IImageFilter extends IFilter {
  state?: string;
}

export class ImageFilter extends BaseFilter implements IImageFilter {
  toCriteria(): ResourceCriteria {
    const data: ResourceCriteria = {
      tag: this.getArrayStringField('tag'),
      detailTag: this.getArrayStringField('detailTag'),
      resourceType: (this.getStringField('resourceType') as ResourceType) ?? ResourceType.Image,
      title: this.getStringField('title'),
      state: this.getStringField('state') as ResourceState,
      ids: this.getArrayStringField('ids'),
      searchWords: this.getSearch(),
      fromDate: this.getStringField('fromDate'),
      toDate: this.getStringField('toDate'),
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
}
