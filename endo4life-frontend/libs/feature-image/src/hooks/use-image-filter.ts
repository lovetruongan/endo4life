import { useCallback, useMemo } from 'react';
import { ImageFilter } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { IFilter } from '@endo4life/types';

const DEFAULT_FILTER: IFilter = {
  page: 0,
  size: 20,
  resourceType: 'IMAGE',
  sort: {
    field: 'createdAt',
    order: 'DESC',
  }
};

export function useImageFilter() {
  const location = useLocation();

  const filter = useMemo(() => {
    const imageFilter = new ImageFilter(DEFAULT_FILTER);
    imageFilter.fromSearchParams(new URLSearchParams(location.search));
    return imageFilter.toFilter();
  }, [location.search]);

  const navigate = useNavigate();

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      const newFilter = { ...filter, ...value };
      const entityFilter = new ImageFilter(newFilter);
      const filterSearchParams = entityFilter.toSearchParams();
      const search = filterSearchParams.toString();
      const newLocation = { ...location, search, hash: '' };
      navigate(newLocation);
    },
    [filter, location, navigate]
  );

  return { filter, updateFilter };
}
