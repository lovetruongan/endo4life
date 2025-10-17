import IconButton from '@mui/material/IconButton';
import { BaseEntity, ITableColumn, SortOrderEnum } from '@endo4life/types';
import { VscArrowDown, VscArrowUp } from 'react-icons/vsc';

interface ColumnHeaderProps<T extends BaseEntity> {
  column: ITableColumn<T>;
  onClick(colum: ITableColumn<T>): void;
  sortOrder?: string;
}
export function ColumnHeader<T extends BaseEntity>({
  column,
  sortOrder,
  onClick,
}: ColumnHeaderProps<T>) {
  return (
    <div className="flex items-center gap-1">
      {!column.sortable && (
        <span className="font-semibold whitespace-nowrap">{column.label}</span>
      )}
      {column.sortable && (
        <button
          className="font-semibold whitespace-nowrap"
          onClick={() => onClick && onClick(column)}
        >
          {column.label}
        </button>
      )}
      {column.sortable && sortOrder && (
        <IconButton onClick={() => onClick && onClick(column)}>
          {sortOrder === SortOrderEnum.ASC && <VscArrowUp size={16} />}
          {sortOrder === SortOrderEnum.DESC && <VscArrowDown size={16} />}
        </IconButton>
      )}
    </div>
  );
}

export default ColumnHeader;
