import { UserResourceType } from '@endo4life/data-access';
import { useAuthContext } from '@endo4life/feature-auth';
import {
  DEFAULT_PAGINATION,
  IEntityData
} from '@endo4life/types';
import { useQuery } from 'react-query';
import { ResourceApiImpl } from '../api';
import { IResourceEntity, ResourceTypeEnum } from '../types';

const QUERY_KEY = 'STUDENT_WEB_RESOURCES';

interface IResourcesAccessedProps {
  resourceType: ResourceTypeEnum;
}

export function useResourcesAccessed({
  resourceType,
}: IResourcesAccessedProps): IEntityData<IResourceEntity> {
  const { userProfile } = useAuthContext();
  const userId = userProfile?.id || '';

  const { data, error, isFetching } = useQuery(
    [QUERY_KEY, userId],
    async () => {
      return new ResourceApiImpl().getResourcesAccessedByUserInfoIdAndType(
        userId || '',
        resourceType as UserResourceType,
      );
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
    },
  );

  return {
    loading: isFetching,
    data: data?.data,
    pagination: {
      page: (data?.pagination?.page ?? DEFAULT_PAGINATION.PAGE) + 1,
      size: data?.pagination?.size ?? DEFAULT_PAGINATION.PAGE_SIZE,
      totalCount: data?.pagination?.totalCount ?? 0,
    },
    error,
  };
}
