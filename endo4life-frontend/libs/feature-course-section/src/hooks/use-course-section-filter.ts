import { useCallback, useMemo } from 'react';
import { CourseSectionFilter } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { IFilter } from '@endo4life/types';

const DEFAULT_FILTER = {
  page: 0,
  size: 10,
};

export function useCourseSectionFilter(courseId: string) {
  const location = useLocation();

  const filter = useMemo(() => {
    const courseSectionFilter = new CourseSectionFilter(DEFAULT_FILTER);
    courseSectionFilter.fromSearchParams(new URLSearchParams(location.search), [
      'lectureId',
    ]);
    courseSectionFilter.setQuery('courseId', courseId);
    return courseSectionFilter.toFilter();
  }, [location.search, courseId]);

  const navigate = useNavigate();

  const updateFilter = useCallback(
    (value: Partial<IFilter>) => {
      const newFilter = { ...filter, ...value };
      const entityFilter = new CourseSectionFilter(newFilter);
      const filterSearchParams = entityFilter.toSearchParams();
      const search = filterSearchParams.toString();
      const newLocation = { ...location, search, hash: '' };
      navigate(newLocation);
    },
    [filter, location, navigate],
  );

  return { filter, updateFilter };
}
