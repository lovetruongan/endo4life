import { BaseEntity } from './entity';
import { IPagination } from './pagination';

export interface IResponse<T extends BaseEntity, M = any> {
  data?: T;
  loading?: boolean;
  error?: any;
  metadata?: M;
}
export interface IPaginatedResponse<T extends BaseEntity, M = any> {
  data?: T[];
  loading?: boolean;
  error?: any;
  pagination?: IPagination;
  metadata?: M;
}
