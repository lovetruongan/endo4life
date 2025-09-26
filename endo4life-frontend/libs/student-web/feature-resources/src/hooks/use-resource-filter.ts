import { IFilter, SortOrderEnum } from '@endo4life/types';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResourceFilter } from '../types';
import { IResourceFilter, ResourceTypeEnum } from './../types/resource-filter';

const DEFAULT_FILTER_RESOURCE = {
  page: 0,
  size: 10,
  queries: [
    {
      field: 'resourceType',
      value: ResourceTypeEnum.IMAGE,
    },
  ],
  sort: {
    field: 'createdAt',
    order: SortOrderEnum.DESC,
  },
};

export function useResourceFilters(useSearchParams = true): {
  filter: IResourceFilter;
  updateFilter: (filter: IResourceFilter) => void;
} {
  const navigate = useNavigate();
  const location = useLocation();
  const [localFilter, setLocalFilter] = useState<IFilter>(
    DEFAULT_FILTER_RESOURCE,
  );

  const filter = useMemo(() => {
    const resourceFilter = new ResourceFilter(DEFAULT_FILTER_RESOURCE);
    resourceFilter.fromSearchParams(new URLSearchParams(location.search));
    return resourceFilter.toFilter();
  }, [location.search]);

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      if (!useSearchParams) {
        setLocalFilter((prev) => ({ ...prev, ...value }));
        return;
      }
      const newFilter = { ...filter, ...value };
      const entityFilter = new ResourceFilter(newFilter);
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
