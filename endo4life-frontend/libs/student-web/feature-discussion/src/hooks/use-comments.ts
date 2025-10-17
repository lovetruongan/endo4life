import { DEFAULT_PAGINATION, IEntityData, IFilter } from "@endo4life/types";
import { CommentFilter, ICommentEntity } from "../types";
import { useQuery } from "react-query";
import { CommentApiIml } from "../api";
import { REACT_QUERY_KEYS } from "../constants";

export function useComments(
  filter: IFilter,
  entityField?: string,
  entityIdValue?: string,
): IEntityData<ICommentEntity> {
  const newFilter = new CommentFilter(filter);
  entityField && entityIdValue && newFilter.setQuery(entityField, entityIdValue);
  const { data, error, isFetching, refetch } = useQuery(
    [REACT_QUERY_KEYS.COMMENTS, newFilter.toFilter()],
    async () => new CommentApiIml().getComments(newFilter.toFilter()),
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
    refetch,
    error,
  };
}