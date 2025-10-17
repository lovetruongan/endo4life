import { IFilter, SortOrderEnum } from "@endo4life/types";
import { CommentFilter, ICommentFilter } from "../types";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";

const DEFAULT_FILTER_COMMENTS = {
  page: 0,
  size: 999,
  sort: {
    field: 'createdAt',
    order: SortOrderEnum.DESC,
  },
};

export function useCommentFilters(
  useSearchParams = true,
): {
  filter: ICommentFilter;
  updateFilter: (filter: ICommentFilter) => void;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const [localFilter, setLocalFilter] = useState<IFilter>(
    DEFAULT_FILTER_COMMENTS,
  );

  const filter = useMemo(() => {
    const commentFilter = new CommentFilter(DEFAULT_FILTER_COMMENTS);
    commentFilter.fromSearchParams(new URLSearchParams(location.search));
    return commentFilter.toFilter();
  }, [location.search]);

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      if (!useSearchParams) {
        setLocalFilter((prev) => ({ ...prev, ...value }));
        return;
      }
      const newFilter = { ...filter, ...value };
      const entityFilter = new CommentFilter(newFilter);
      const filterSearchParams = entityFilter.toSearchParams();
      const search = filterSearchParams.toString();
      const newLocation = { ...location, search, hash: '' };
      navigate(newLocation, { replace: true });
    },
    [filter, location, navigate, useSearchParams],
  );

  return {
    filter: useSearchParams ? filter : localFilter,
    updateFilter,
  };
}
