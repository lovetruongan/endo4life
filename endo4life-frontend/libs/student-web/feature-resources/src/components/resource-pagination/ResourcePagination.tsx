import { IFilter, IPagination } from '@endo4life/types';
import { Pagination } from '@endo4life/ui-common';
import clsx from 'clsx';
import { ResourceFilter } from '../../types';
import styles from './ResourcePagination.module.css';

interface Props {
  pagination?: IPagination;
  filter: IFilter;
  onChange(filter: IFilter): void;
}
export function ResourcePagination({ pagination, filter, onChange }: Props) {

  const handlePageChange = (page: number) => {
    const newFilter = new ResourceFilter(filter);
    newFilter.setPage(page);
    onChange(newFilter);
  }

  const handlePageSizeChange = (size: number) => {
    const newFilter = new ResourceFilter(filter);
    newFilter.setPageSize(size);
    onChange(newFilter);
  }

  return (
    <div className={clsx(styles['container'], {
      '': true,
    })}>
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isShowFullPagination={true}
        />
      )}
    </div>
  );
}

export default ResourcePagination;
