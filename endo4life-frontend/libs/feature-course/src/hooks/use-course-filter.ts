import { useCallback, useMemo } from 'react';
import { CourseFilter } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { IFilter } from '@endo4life/types';

const DEFAULT_FILTER: IFilter = {
  page: 0,
  size: 10,
  // sort:{field: 'lastUpdated',order: SortOrderEnum.ASC}
};

export function useCourseFilter() {
  const location = useLocation();

  const filter = useMemo(() => {
    const courseFilter = new CourseFilter(DEFAULT_FILTER);
    courseFilter.fromSearchParams(new URLSearchParams(location.search));
    return courseFilter.toFilter();
  }, [location.search]);

  const navigate = useNavigate();

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      const newFilter = { ...filter, ...value };
      const entityFilter = new CourseFilter(newFilter);
      const filterSearchParams = entityFilter.toSearchParams();
      const search = filterSearchParams.toString();
      const newLocation = { ...location, search, hash: '' };
      navigate(newLocation);
    },
    [filter, location, navigate],
  );

  return { filter, updateFilter };
}
