import { IResourceEntity } from "./resource-entity";

export interface ResourceDetailContextParams {
  resource: IResourceEntity;
  entityField: string;
  entityIdValue: string;
}
