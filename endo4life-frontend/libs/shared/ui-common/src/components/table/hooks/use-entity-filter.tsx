import { IFilter } from '@endo4life/types';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Props {
  defaultPage?: number;
  defaultPageSize?: number;
}
export function useEntityFilter({
  defaultPage = 1,
  defaultPageSize = 10,
}: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const filter = useMemo<IFilter>(() => {
    const urlSearchParams = new URLSearchParams(location.search ?? '');

    function getQueryParam(key: string, defaultValue: string) {
      const value = urlSearchParams.get(key);
      return value ?? defaultValue;
    }

    function parseSort(sortStr?: string) {
      if (!sortStr) return undefined;
      const values = sortStr.split(':');
      if (!values || values.length !== 2) return undefined;
      return { field: values[0], order: values[1] };
    }

    function getQueryFilters() {
      const queries = [];
      for (const key of urlSearchParams.keys()) {
        if (!key.startsWith('filter.')) continue;
        const items = key.split('.');
        if (items && items.length === 2) {
          queries.push({
            field: items[1],
            operation: '$eq',
            value: getQueryParam(key, ''),
          });
        } else if (items && items.length === 3) {
          queries.push({
            field: items[1],
            operation: items[2],
            value: getQueryParam(key, ''),
          });
        }
      }
      return queries;
    }
    const page = getQueryParam('page', defaultPage.toString());
    const size = getQueryParam('size', defaultPageSize.toString());
    const search = getQueryParam('search', '');
    const sortStr = getQueryParam('sort', '');
    const queryFilters = getQueryFilters();

    return {
      page: parseInt(page),
      size: parseInt(size),
      search,
      sort: parseSort(sortStr),
      queries: queryFilters,
    };
  }, [location.search, defaultPageSize, defaultPage]);

  function updateFilter(value: Partial<IFilter>) {
    const newFilter: IFilter = {
      ...filter,
      ...value,
    };

    const searchParams = new URLSearchParams();
    if (newFilter.page !== defaultPage) {
      searchParams.set('page', newFilter.page?.toString() ?? '');
    }
    if (newFilter.page !== defaultPageSize) {
      searchParams.set('size', newFilter.size?.toString() ?? '');
    }
    if (newFilter.search) {
      searchParams.set('search', newFilter.search);
    }
    if (newFilter.sort) {
      searchParams.set(
        'sort',
        `${newFilter.sort.field}:${newFilter.sort.order}`
      );
    }
    if (newFilter.queries) {
      for (const query of newFilter.queries) {
        if (!query.value) continue;
        const key = `filter.${query.field}.${query.operator ?? '$eq'}`;
        searchParams.set(key, query.value);
      }
    }

    const newLocation = {
      ...location,
      search: searchParams.toString(),
      hash: '',
    };
    navigate(newLocation);
  }

  function setFilterParams(
    items: { query: string; value: string }[],
    exact = false
  ) {
    const searchParams = exact ? '' : location.search;
    const urlSearchParams = new URLSearchParams(searchParams);

    for (const pair of items) {
      const { query, value } = pair;
      if (typeof value === 'object' && Array.isArray(value)) {
        urlSearchParams.delete(query);
        const arrStr: string[] = value;
        for (const val of arrStr) {
          urlSearchParams.append(query, val);
        }
        continue;
      }

      if (value) {
        if (urlSearchParams.has(query)) {
          urlSearchParams.set(query, value);
        } else {
          urlSearchParams.append(query, value);
        }
      } else {
        urlSearchParams.delete(query);
      }
    }

    const newLocation = {
      ...location,
      search: urlSearchParams.toString(),
      hash: '',
    };
    navigate(newLocation);
  }

  function setFilterParam(
    key: string,
    value: string,
    exact = false,
    addIfExists = false
  ) {
    const searchParams = exact ? '' : location.search;
    const urlSearchParams = new URLSearchParams(searchParams);
    if (value) {
      if (addIfExists) {
        urlSearchParams.append(key, value);
      } else {
        urlSearchParams.set(key, value);
      }
    } else {
      urlSearchParams.delete(key);
    }
    const newLocation = { ...location, search: urlSearchParams.toString() };
    navigate(newLocation);
  }
  return { filter, updateFilter, setFilterParam, setFilterParams };
}
