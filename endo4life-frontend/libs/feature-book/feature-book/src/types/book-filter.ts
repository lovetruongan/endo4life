import { ResourceState } from './book-entity';

export interface IBookFilter {
  title?: string;
  state?: ResourceState;
  createdBy?: string;
  tag?: string[];
  author?: string;
  publisher?: string;
  publishYear?: number;
  page?: number;
  size?: number;
  sort?: string;
}

