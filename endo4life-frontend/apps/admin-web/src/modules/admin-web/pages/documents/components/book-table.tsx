import { IBookEntity } from '../types';
import { AgGrid } from '@endo4life/ui-common';
import { useBookManagementColumns } from '../hooks/use-book-management-columns';
import { GridColDef } from '@endo4life/types';
import { useToggle } from 'ahooks';
import { SelectionChangedEvent, SortChangedEvent } from 'ag-grid-community';
import { RefObject } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { booleanUtils, arrayUtils } from '@endo4life/util-common';

interface Props {
  gridRef: RefObject<AgGridReact>;
  data: IBookEntity[];
  loading?: boolean;
  onSortChange?: (e: SortChangedEvent) => void;
  onSelectionChanged?: (selectedBooks: IBookEntity[]) => void;
  onEdit: (book: IBookEntity) => void;
  onDelete: (book: IBookEntity) => void;
}

export function BookTable({
  gridRef,
  data,
  loading,
  onSortChange,
  onSelectionChanged,
  onEdit,
  onDelete,
}: Props) {
  const [openToolDialog, toolDialogToggle] = useToggle(false);

  const { columns, updateColumns } = useBookManagementColumns({
    openToolDialog,
    onToggleToolDialog,
    onEdit,
    onDelete,
  });

  function onToggleToolDialog() {
    toolDialogToggle.toggle();
  }

  function onChangeColumns(cols: GridColDef<IBookEntity>[]) {
    updateColumns(cols);
  }

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedBooks = selectedRows.map((row: IBookEntity) => row);
    onSelectionChanged?.(selectedBooks);
  };

  return (
    <div className="rounded-lg">
      <AgGrid
        gridRef={gridRef}
        openToolDialog={openToolDialog}
        columns={columns}
        rowData={arrayUtils.defaultArray(data)}
        loading={booleanUtils.defaultBoolean(loading)}
        onToggleToolDialog={onToggleToolDialog}
        onChangeColumns={onChangeColumns}
        onSortChanged={onSortChange}
        onSelectionChanged={handleSelectionChanged}
      />
    </div>
  );
}

export default BookTable;

