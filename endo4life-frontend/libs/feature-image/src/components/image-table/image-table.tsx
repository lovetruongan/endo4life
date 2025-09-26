import { IImageEntity } from '../../types';
import { AgGrid } from '@endo4life/ui-common';
import { useImageManagementColumns } from '../../hooks/use-image-management-columns';
import { GridColDef } from '@endo4life/types';
import { useToggle } from 'ahooks';
import {
  GridOptions,
  SelectionChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import ImageStateDialog from '../image-state-dialog/image-state-dialog';
import { RefObject, useState } from 'react';
import { ResourceState } from '@endo4life/data-access';
import { AgGridReact } from 'ag-grid-react';
import { booleanUtils } from '@endo4life/util-common';

interface Props {
  gridRef: RefObject<AgGridReact>;
  data: IImageEntity[];
  loading?: boolean;
  onSortChange?: (e: SortChangedEvent) => void;
  onSelectionChanged?: (selectedImageIds: IImageEntity[]) => void;
  onDeselectAll?: () => void;
}

export function ImageTable({
  gridRef,
  data,
  loading,
  onSortChange,
  onSelectionChanged,
  onDeselectAll,
}: Props) {
  const [openToolDialog, toolDialogToggle] = useToggle(false);
  const [openStateDialog, openStateDialogAction] = useToggle(false);
  const [selectImage, setSelectImage] = useState<string>('');
  const [stateImage, setStateImage] = useState<ResourceState | undefined>(
    undefined,
  );
  const { columns, updateColumns } = useImageManagementColumns({
    openToolDialog,
    onToggleToolDialog,
    openStateDialogAction,
    onSelectImage: setSelectImage,
    onSetStateImage: setStateImage,
  });

  function onToggleToolDialog() {
    toolDialogToggle.toggle();
  }

  function onChangeColumns(cols: GridColDef<IImageEntity>[]) {
    updateColumns(cols);
  }

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedImages = selectedRows.map((row: IImageEntity) => row);
    onSelectionChanged?.(selectedImages);
  };

  return (
    <>
      <div className="rounded-lg">
        <AgGrid
          gridRef={gridRef}
          hasTableTool
          openToolDialog={openToolDialog}
          columns={columns}
          rowData={data || []}
          loading={booleanUtils.defaultBoolean(loading)}
          onToggleToolDialog={onToggleToolDialog}
          onChangeColumns={onChangeColumns}
          onSortChanged={onSortChange}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
      {openStateDialog && (
        <ImageStateDialog
          imageId={selectImage}
          state={stateImage}
          onClose={() => openStateDialogAction.setLeft()}
        />
      )}
    </>
  );
}

export default ImageTable;
