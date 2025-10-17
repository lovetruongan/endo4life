import { SortOrderEnum } from './sort';

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
};

export const ParamsKey = {
  PAGE: 'page',
  PAGE_SIZE: 'size',
  STATUS: 'status',
  SORT: 'sort',
  SEARCH: 'search',
  QUERY: 'query',
  ID: 'id',
};

export interface IFilter {
  page?: number;
  size?: number;
  search?: string;
  sort?: IFilterSort;
  queries?: IFilterQuery[];
}

export interface IFilterSort {
  field: string;
  order: string /** asc, desc */;
}

export interface IFilterQuery {
  field: string;
  operator?: string /** $eq, $ne, $co, $sw, $ew, $gt, $ge, $lt, $le */;
  value?: string;
}

export enum FilterOperatorEnum {
  EQUAL = '$eq',
  NOT_EQUAL = '$ne',
  CONTAINS = '$co',
  START_WITH = '$sw',
  END_WITH = '$ew',
  GREATER_THAN = '$gt',
  GREATER_THAN_EQUAL = '$ge',
  LESS_THAN = '$lt',
  LESS_THAN_EQUAL = '$le',
}

type EnumType = { [key: string]: string };

export class BaseFilter implements IFilter {
  page?: number | undefined;
  size?: number | undefined;
  search?: string | undefined;
  sort?: IFilterSort | undefined;
  queries?: IFilterQuery[] | undefined;

  constructor(filter?: IFilter) {
    this.page = filter?.page ?? 0;
    this.size = filter?.size ?? 20;
    this.search = filter?.search;
    this.queries = filter?.queries ?? [];
    this.sort = filter?.sort;
  }

  toFilter() {
    return {
      page: this.page,
      size: this.size,
      search: this.search,
      sort: this.sort,
      queries: this.queries,
    };
  }

  getQuery(key: string) {
    return this.queries?.find((q) => q.field === key);
  }

  setQuery(key: string, value?: string, operator: string = '$eq') {
    const queries = (this.queries ?? []).filter((q) => q.field !== key);
    if (value?.trim()) queries.push({ field: key, value, operator });
    this.queries = queries;
    return this;
  }

  removeQuery(key: string) {
    const queries = (this.queries ?? []).filter((q) => q.field !== key);
    this.queries = queries;
    return this;
  }

  getStringField(key: string): string | undefined {
    try {
      const value = this.getQuery(key)?.value;
      return value ? value : undefined;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getArrayStringField(key: string): string[] | undefined {
    try {
      const value = this.getQuery(key)?.value?.split(',');
      return value ? value : undefined;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getDateField(key: string): Date | undefined {
    try {
      const value = this.getQuery(key)?.value;
      return value ? new Date(value) : undefined;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getArrayDateField(key: string): Date[] | undefined {
    try {
      const value = this.getQuery(key)?.value?.split(',');
      return value ? value.map((item) => new Date(item)) : undefined;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getNumberField(key: string): number | undefined {
    try {
      const value = this.getQuery(key)?.value;
      return value ? parseInt(value.trim()) : undefined;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getArrayNumberField(key: string): number[] | undefined {
    try {
      const value = this.getQuery(key)
        ?.value?.split(',')
        .map((item) => parseInt(item.trim()));
      return value ? value : undefined;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getBooleanField(key: string): boolean | undefined {
    try {
      const value = this.getQuery(key)?.value;
      if (!value) return undefined;
      return value?.toLowerCase() === 'true' || value === '1';
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getArrayBooleanField(key: string): boolean[] | undefined {
    try {
      const value = this.getQuery(key)?.value;
      return value
        ?.split(',')
        .map((item) => item.trim().toLowerCase())
        .map((item) => item === 'true' || value === '1');
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getEnumField<T extends EnumType>(
    key: string,
    enumType: T,
  ): T[keyof T] | undefined {
    try {
      const value = this.getQuery(key)?.value;
      if (value) {
        const enumValue = (Object.values(enumType) as string[]).find(
          (v) => v === value,
        );
        return enumValue as T[keyof T];
      }
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }

  getPage() {
    return this.page;
  }

  getPageSize() {
    return this.size;
  }

  getSearch() {
    return this.search;
  }

  setPage(page: number) {
    this.page = page;
    return this;
  }

  setPageSize(size: number) {
    this.size = size;
    return this;
  }

  setSearch(value?: string) {
    if (!value) {
      this.search = undefined;
    } else {
      this.search = value;
    }
    return this;
  }

  toPageable() {
    return {
      page: this.getPage() ?? 0,
      size: this.getPageSize(),
      sort: this.getSortArrayString(),
    };
  }

  setSort(field?: string, order?: string) {
    if (field === undefined) {
      this.sort = undefined;
    } else {
      this.sort = { field, order: order ?? SortOrderEnum.DESC };
    }
    return this;
  }

  getSort() {
    return this.sort;
  }

  getSortString() {
    if (!this.sort) return undefined;
    return `${this.sort.field},${this.sort.order}`;
  }
  getSortArrayString() {
    if (!this.sort) return undefined;
    return [`${this.sort.field},${this.sort.order}`];
  }

  getStatus() {
    return this.getStringField(ParamsKey.STATUS);
  }

  setStatus(status: string | undefined) {
    return this.setQuery(ParamsKey.STATUS, status);
  }

  fromSearchParams(searchParams: URLSearchParams, ignoreKeys?: string[]) {
    for (const key of searchParams.keys()) {
      if (ignoreKeys && ignoreKeys.includes(key)) continue;
      const value = searchParams.get(key);
      if (!value) continue;
      if (key === ParamsKey.PAGE) {
        this.setPage(parseInt(value) - 1);
      } else if (key === ParamsKey.PAGE_SIZE) {
        this.setPageSize(parseInt(value));
      } else if (key === ParamsKey.SORT) {
        if (value) {
          const items = value.split(',').map((item) => item.trim());
          if (items.length >= 2) this.setSort(items[0], items[1]);
        } else {
          this.setSort(undefined);
        }
      } else if (key === ParamsKey.SEARCH) {
        this.setSearch(value);
      } else {
        this.setQuery(key, value);
      }
    }
  }

  toSearchParams() {
    const searchParams = new URLSearchParams();
    const page = this.page !== undefined ? (this.page + 1).toString() : '';
    const pageSize = this.getPageSize()?.toString() ?? '';
    const sort = this.getSortString() ?? '';
    const search = this.getSearch() ?? '';
    if (page) searchParams.set(ParamsKey.PAGE, page);
    if (pageSize) searchParams.set(ParamsKey.PAGE_SIZE, pageSize);
    if (sort) searchParams.set(ParamsKey.SORT, sort);
    if (search) searchParams.set(ParamsKey.SEARCH, search);

    for (const query of this.queries ?? []) {
      if (query.value) searchParams.set(query.field, query.value);
    }
    return searchParams;
  }
}

export interface IFilterBuilder {
  setPage(page: number): IFilterBuilder;
  setPageSize(pageSize: number): IFilterBuilder;
  setSearch(search: string): IFilterBuilder;
  setSort(sort: IFilterSort): IFilterBuilder;
  addQuery(query: IFilterQuery): IFilterBuilder;
  clearQueries(): IFilterBuilder;
  build(): IFilter;
}

export class FilterBuilder implements IFilterBuilder {
  private _page?: number;
  private _size?: number;
  private _search?: string;
  private _sort?: IFilterSort;
  private _queries?: IFilterQuery[];
  constructor(
    page = DEFAULT_PAGINATION.PAGE,
    size = DEFAULT_PAGINATION.PAGE_SIZE,
  ) {
    this._page = page;
    this._size = size;
    this._queries = [];
  }
  setPage(page: number): IFilterBuilder {
    this._page = page;
    return this;
  }
  setPageSize(pageSize: number): IFilterBuilder {
    this._size = pageSize;
    return this;
  }
  setSearch(search: string): IFilterBuilder {
    this._search = search;
    return this;
  }
  setSort(sort: IFilterSort): IFilterBuilder {
    this._sort = sort;
    return this;
  }
  addQuery(query: IFilterQuery): IFilterBuilder {
    this._queries?.push(query);
    return this;
  }
  clearQueries(): IFilterBuilder {
    this._queries = [];
    return this;
  }
  build(): IFilter {
    return {
      page: this._page,
      size: this._size,
      search: this._search,
      sort: this._sort,
      queries: this._queries,
    };
  }
}

export interface IFilterSortBuilder {
  setField(field: string): IFilterSortBuilder;
  setOrder(order: string): IFilterSortBuilder;
  build(): IFilterSort;
}

export class FilterSortBuilder implements IFilterSortBuilder {
  private _field: string;
  private _order: string;

  constructor(field: string, order = SortOrderEnum.ASC) {
    this._field = field;
    this._order = order;
  }

  setField(field: string): IFilterSortBuilder {
    this._field = field;
    return this;
  }
  setOrder(order: string): IFilterSortBuilder {
    this._order = order;
    return this;
  }
  build(): IFilterSort {
    return {
      field: this._field,
      order: this._order,
    };
  }
}

export interface IFilterQueryBuilder {
  setField(field: string): IFilterQueryBuilder;
  setOperator(order: string): IFilterQueryBuilder;
  setValue(value: string): IFilterQueryBuilder;
  build(): IFilterQuery;
}

export class FilterQueryBuilder implements IFilterQueryBuilder {
  private _field: string;
  private _operator?: string;
  private _value?: string;
  constructor(field: string, value?: string) {
    this._field = field;
    this._value = value;
    this._operator = FilterOperatorEnum.EQUAL;
  }

  setField(field: string): IFilterQueryBuilder {
    this._field = field;
    return this;
  }
  setOperator(operator: string): IFilterQueryBuilder {
    this._operator = operator;
    return this;
  }

  setValue(value: string): IFilterQueryBuilder {
    this._value = value;
    return this;
  }
  build(): IFilterQuery {
    return {
      field: this._field,
      operator: this._operator,
      value: this._value,
    };
  }
}

export const filterUtils = {
  getQuery(filter: IFilter, field: string): IFilterQuery | undefined {
    return filter.queries?.find((item) => item.field === field);
  },

  getString(filter: IFilter, field: string): string | undefined {
    return filter.queries?.find((item) => item.field === field)?.value;
  },
  getSort(filter: IFilter): IFilterSort | undefined {
    return filter.sort;
  },

  getArrayString(filter: IFilter, field: string): string[] | undefined {
    return filter.queries
      ?.find((item) => item.field === field)
      ?.value?.split(',');
  },
  getNumber: (filter: any, field: string, defaultValue: number = 0): number => {
    const stringValue = filterUtils.getString(filter, field);
    if (stringValue) {
      return Number(stringValue);
    }
    return defaultValue;
  },
  getArray: (filter: any, field: string): any[] => {
    return filter && Array.isArray(filter[field]) ? filter[field] : [];
  },
  getDate: (filter: any, field: string): Date | null => {
    return filter && filter[field] ? new Date(filter[field]) : null;
  },
};
