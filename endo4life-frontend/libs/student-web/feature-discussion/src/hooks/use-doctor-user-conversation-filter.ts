import { IFilter, SortOrderEnum } from "@endo4life/types";
import { DoctorUserConversationFilter, IDoctorUserConversationFilter } from "../types";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";

const DEFAULT_FILTER_CONVERSATIONS = {
  page: 0,
  size: 999,
  sort: {
    field: 'createdAt',
    order: SortOrderEnum.DESC,
  },
};

export function useDoctorUserConversationFilters(
  useSearchParams = true,
): {
  filter: IDoctorUserConversationFilter;
  updateFilter: (filter: IDoctorUserConversationFilter) => void;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const [localFilter, setLocalFilter] = useState<IFilter>(
    DEFAULT_FILTER_CONVERSATIONS,
  );

  const filter = useMemo(() => {
    const conversationFilter = new DoctorUserConversationFilter(DEFAULT_FILTER_CONVERSATIONS);
    conversationFilter.fromSearchParams(new URLSearchParams(location.search));
    return conversationFilter.toFilter();
  }, [location.search]);

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      if (!useSearchParams) {
        setLocalFilter((prev) => ({ ...prev, ...value }));
        return;
      }
      const newFilter = { ...filter, ...value };
      const entityFilter = new DoctorUserConversationFilter(newFilter);
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

