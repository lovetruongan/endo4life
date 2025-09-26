import { IUserEntity } from '../../types';
import { AgGrid } from '@endo4life/ui-common';
import { useUserManagementColumns } from '../../hooks/use-user-management-columns';
import { GridColDef } from '@endo4life/types';
import { useToggle } from 'ahooks';
import { SelectionChangedEvent, SortChangedEvent } from 'ag-grid-community';
import { RefObject } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { arrayUtils, booleanUtils } from '@endo4life/util-common';

interface Props {
  gridRef: RefObject<AgGridReact>;
  data: IUserEntity[];
  loading?: boolean;
  onSortChange?: (e: SortChangedEvent) => void;
  onSelectionChanged?: (selectedImageIds: IUserEntity[]) => void;
  onDeselectAll?: () => void;
}

export function UserTable({
  gridRef,
  data,
  loading,
  onSortChange,
  onSelectionChanged,
  onDeselectAll,
}: Props) {
  const [openToolDialog, toolDialogToggle] = useToggle(false);
  const { columns, updateColumns } = useUserManagementColumns({
    openToolDialog,
    onToggleToolDialog,
  });

  function onToggleToolDialog() {
    toolDialogToggle.toggle();
  }

  function onChangeColumns(cols: GridColDef<IUserEntity>[]) {
    updateColumns(cols);
  }

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedImages = selectedRows.map((row: IUserEntity) => row);
    onSelectionChanged?.(selectedImages);
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

export default UserTable;
