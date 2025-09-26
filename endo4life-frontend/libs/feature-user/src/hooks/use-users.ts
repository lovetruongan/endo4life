import { IEntityData, IFilter } from '@endo4life/types';
import { useQuery } from 'react-query';
import { UserApiImpl } from '../api';
import { IUserEntity } from '../types';
import { DEFAULT_PAGINATION, REACT_QUERY_KEYS } from '../constants';

export function useUsers(filter: IFilter): IEntityData<IUserEntity> {
  const { data, error, isFetching } = useQuery(
    [REACT_QUERY_KEYS.USERS, filter],
    async () => {
      return new UserApiImpl().getUsers(filter);
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return {
    loading: isFetching,
    data: data?.data,
    pagination: {
      page: (data?.pagination?.page ?? DEFAULT_PAGINATION.PAGE) + 1,
      size: data?.pagination?.size ?? DEFAULT_PAGINATION.SIZE,
      totalCount: data?.pagination?.totalCount ?? 0,
    },
    error,
  };
}
