import { ReactNode } from 'react';
import { BaseEntity } from './entity';

export interface ITableColumn<T extends BaseEntity> {
  id: string;
  label: string | ReactNode;
  field: keyof T | 'checkbox' | 'action';
  className?: string;
  width?: string | number;
  hidden?: boolean;
  sortable?: boolean;
  render?(data: T): string | number | ReactNode;
}
