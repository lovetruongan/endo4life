import { useCallback, useMemo } from 'react';
import { UserFilter } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { IFilter } from '@endo4life/types';

const DEFAULT_FILTER = {
  page: 0,
  size: 10,
};

export function useUserFilter() {
  const location = useLocation();

  const filter = useMemo(() => {
    const userFilter = new UserFilter(DEFAULT_FILTER);
    userFilter.fromSearchParams(new URLSearchParams(location.search));
    return userFilter.toFilter();
  }, [location.search]);

  const navigate = useNavigate();

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      const newFilter = { ...filter, ...value };
      const entityFilter = new UserFilter(newFilter);
      const filterSearchParams = entityFilter.toSearchParams();
      const search = filterSearchParams.toString();
      const newLocation = { ...location, search, hash: "" };
      navigate(newLocation);
    },
    [filter, location, navigate]
  );

  return { filter, updateFilter };
}
