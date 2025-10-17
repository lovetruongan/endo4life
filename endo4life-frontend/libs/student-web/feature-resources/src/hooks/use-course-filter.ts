import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IFilter, SortOrderEnum } from '@endo4life/types';
import { CourseFilter, ICourseFilter } from '../types';

const DEFAULT_FILTER = {
  page: 0,
  size: 10,
  sort: {
    field: 'createdAt',
    order: SortOrderEnum.DESC,
  },
};

export function useCourseFilters(useSearchParams = true): {
  filter: ICourseFilter;
  updateFilter: (filter: ICourseFilter) => void;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const [localFilter, setLocalFilter] = useState<IFilter>(DEFAULT_FILTER);

  const filter = useMemo(() => {
    const courseFilter = new CourseFilter(DEFAULT_FILTER);
    courseFilter.fromSearchParams(new URLSearchParams(location.search));
    return courseFilter.toFilter();
  }, [location.search]);

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      if (!useSearchParams) {
        setLocalFilter((prev) => ({ ...prev, ...value }));
        return;
      }
      const newFilter = { ...filter, ...value };
      const entityFilter = new CourseFilter(newFilter);
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
