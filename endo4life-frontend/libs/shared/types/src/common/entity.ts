import { IAction } from "./action";
import { IPagination } from "./pagination";

export type UniqueId = string | number;

export type IEntityMetadata = { [key: string]: string | number | object };

export interface BaseEntity<M = any> {
  id: UniqueId;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  metadata?: M;
  isNew?: boolean;
  dirty?: boolean;
}

export function getEntityMetadata<T extends BaseEntity>(
  entity: T,
  key: string,
  defaultValue?: any
) {
  if (!entity || !entity.metadata || !entity.metadata.hasOwnProperty(key)) {
    return defaultValue;
  }
  return entity.metadata[key];
}

export interface IEntityAction<T extends BaseEntity> extends IAction {
  entities: T[];
}

export enum EntityStatus {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
}

export interface IEntitySelection {
  entityIds: UniqueId[];
  action?: string;
  data?: any;
}

export interface IEntityProvider<T extends BaseEntity> {
  getOne(id: UniqueId): T;
  setOne(entity: T): void;
}

export interface IEntitySelectionProvider {
  isSelected(id: UniqueId): boolean;
  setSelected(id: UniqueId, selected?: boolean): void;
}

export interface IEntityVisibilityProvider {
  isHidden(id: UniqueId): void;
  setHidden(id: UniqueId, hidden?: boolean): void;
}

export interface IEntityData<T extends BaseEntity, M = any> {
  data?: T[];
  loading: boolean;
  pagination?: IPagination;
  error?: any;
  metadata?: M;
  total?:number;
  refetch?: () => void;
}
