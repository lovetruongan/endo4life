import { IVideoEntity } from '../../types';
import { AgGrid } from '@endo4life/ui-common';
import { useVideoManagementColumns } from '../../hooks/use-video-management-columns';
import { GridColDef } from '@endo4life/types';
import { useToggle } from 'ahooks';
import { SelectionChangedEvent, SortChangedEvent } from 'ag-grid-community';
import VideoStateDialog from '../video-state-dialog/video-state-dialog';
import { RefObject, useState } from 'react';
import { ResourceState } from '@endo4life/data-access';
import { AgGridReact } from 'ag-grid-react';
import { arrayUtils, booleanUtils } from '@endo4life/util-common';

interface Props {
  gridRef: RefObject<AgGridReact>;
  data: IVideoEntity[];
  loading?: boolean;
  onSortChange?: (e: SortChangedEvent) => void;
  onSelectionChanged?: (selectedVideoIds: IVideoEntity[]) => void;
}

export function VideoTable({
  gridRef,
  data,
  loading,
  onSortChange,
  onSelectionChanged,
}: Props) {
  const [openToolDialog, toolDialogToggle] = useToggle(false);
  const [openStateDialog, openStateDialogAction] = useToggle(false);
  const [selectVideo, setSelectVideo] = useState<string>('');
  const [stateVideo, setStateVideo] = useState<ResourceState | undefined>(
    undefined,
  );
  const { columns, updateColumns } = useVideoManagementColumns({
    openToolDialog,
    onToggleToolDialog,
    openStateDialogAction,
    onSelectVideo: setSelectVideo,
    onSetStateVideo: setStateVideo,
  });

  function onToggleToolDialog() {
    toolDialogToggle.toggle();
  }

  function onChangeColumns(cols: GridColDef<IVideoEntity>[]) {
    updateColumns(cols);
  }

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedVideos = selectedRows.map((row: IVideoEntity) => row);
    onSelectionChanged?.(selectedVideos);
  };

  return (
    <>
      <div className="rounded-lg">
        <AgGrid
          gridRef={gridRef}
          hasTableTool
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
      {openStateDialog && (
        <VideoStateDialog
          videoId={selectVideo}
          state={stateVideo}
          onClose={() => openStateDialogAction.setLeft()}
        />
      )}
    </>
  );
}

export default VideoTable;
