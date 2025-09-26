import { AgGrid } from '@endo4life/ui-common';
import { useCourseSectionManagementColumns } from '../../hooks/use-course-section-management-columns';
import { GridColDef } from '@endo4life/types';
import { useToggle } from 'ahooks';
import { SelectionChangedEvent, SortChangedEvent } from 'ag-grid-community';
import { RefObject, useState } from 'react';
import { CourseState } from '@endo4life/data-access';
import { AgGridReact } from 'ag-grid-react';
import { ICourseSectionEntity } from '../../types';

interface Props {
  gridRef: RefObject<AgGridReact>;
  data: ICourseSectionEntity[];
  loading?: boolean;
  onSortChange?: (e: SortChangedEvent) => void;
  onSelectionChanged?: (selectedCourseIds: ICourseSectionEntity[]) => void;
  onDeselectAll?: () => void;
}

export function CourseSectionTable({
  gridRef,
  data,
  loading,
  onSortChange,
  onSelectionChanged,
}: Props) {
  const [openToolDialog, toolDialogToggle] = useToggle(false);
  const [openStateDialog, openStateDialogAction] = useToggle(false);
  const [selectCourse, setSelectCourse] = useState<string>('');
  const [stateCourse, setStateCourse] = useState<CourseState | undefined>(
    undefined,
  );
  const { columns, updateColumns } = useCourseSectionManagementColumns({
    openToolDialog,
    onToggleToolDialog,
    openStateDialogAction,
    onSelectCourse: setSelectCourse,
    onSetStateCourse: setStateCourse,
  });

  function onToggleToolDialog() {
    toolDialogToggle.toggle();
  }

  function onChangeColumns(cols: GridColDef<any>[]) {
    updateColumns(cols);
  }

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedImages = selectedRows.map((row: ICourseSectionEntity) => row);
    onSelectionChanged?.(selectedImages);
  };

  return (
    <div className="rounded-lg">
      <AgGrid
        gridRef={gridRef}
        hasTableTool
        openToolDialog={openToolDialog}
        columns={columns}
        rowData={!loading ? data : []}
        loading={loading!}
        onToggleToolDialog={onToggleToolDialog}
        onChangeColumns={onChangeColumns}
        onSortChanged={onSortChange}
        onSelectionChanged={handleSelectionChanged}
        animateRows={false}
      />
    </div>
  );
}

export default CourseSectionTable;
