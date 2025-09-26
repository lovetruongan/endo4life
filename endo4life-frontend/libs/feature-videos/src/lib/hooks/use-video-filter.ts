import { useCallback, useMemo } from 'react';
import { VideoFilter } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { IFilter } from '@endo4life/types';

const DEFAULT_FILTER = {
  page: 0,
  size: 20,
  resourceType: 'VIDEO',
  sort: {
    field: 'createdAt',
    order: 'DESC',
  }
};

export function useVideoFilter() {
  const location = useLocation();

  const filter = useMemo(() => {
    const videoFilter = new VideoFilter(DEFAULT_FILTER);
    videoFilter.fromSearchParams(new URLSearchParams(location.search));
    return videoFilter.toFilter();
  }, [location.search]);

  const navigate = useNavigate();

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      const newFilter = { ...filter, ...value };
      const entityFilter = new VideoFilter(newFilter);
      const filterSearchParams = entityFilter.toSearchParams();
      const search = filterSearchParams.toString();
      const newLocation = { ...location, search, hash: '' };
      navigate(newLocation);
    },
    [filter, location, navigate]
  );

  return { filter, updateFilter };
}
