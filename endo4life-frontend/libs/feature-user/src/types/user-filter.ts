import {
  UserInfoCriteria,
  UserInfoRole,
  UserInfoState,
} from '@endo4life/data-access';
import { BaseFilter, IFilter } from '@endo4life/types';

export interface IUserFilter extends IFilter {
  searchWord?: string;
  role?: string;
  state?: string;
  fromDate?: string;
  toDate?: string;
}

export class UserFilter extends BaseFilter implements IUserFilter {
  toCriteria(): UserInfoCriteria {
    const data: UserInfoCriteria = {
      ids: this.getArrayStringField('ids'),
      searchWord: this.getSearch(),
      role: this.getStringField('role') as UserInfoRole,
      state: this.getStringField('state') as UserInfoState,
      fromDate: this.getStringField('fromDate'),
      toDate: this.getStringField('toDate'),
    };
    for (const key of Object.keys(data)) {
      if (data[key as keyof UserInfoCriteria] === undefined) {
      delete data[key as keyof UserInfoCriteria];
      }
    }
    return data;
  }
}
