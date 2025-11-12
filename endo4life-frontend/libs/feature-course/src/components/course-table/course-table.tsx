import { ICourseEntity } from '../../types';
import { AgGrid } from '@endo4life/ui-common';
import { useCourseManagementColumns } from '../../hooks/use-course-management-columns';
import { GridColDef } from '@endo4life/types';
import { useToggle } from 'ahooks';
import { SelectionChangedEvent, SortChangedEvent } from 'ag-grid-community';
import { RefObject, useState } from 'react';
import { CourseState } from '@endo4life/data-access';
import { AgGridReact } from 'ag-grid-react';
import { arrayUtils, booleanUtils } from '@endo4life/util-common';
import CourseStateDialog from '../course-state-dialog/course-state-dialog';

interface Props {
  gridRef: RefObject<AgGridReact>;
  data: ICourseEntity[];
  loading?: boolean;
  onSortChange?: (e: SortChangedEvent) => void;
  onSelectionChanged?: (selectedCourseIds: ICourseEntity[]) => void;
  onDeselectAll?: () => void;
}

export function CourseTable({
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
    undefined
  );
  const { columns, updateColumns } = useCourseManagementColumns({
    openToolDialog,
    onToggleToolDialog,
    openStateDialogAction,
    onSelectCourse: setSelectCourse,
    onSetStateCourse: setStateCourse,
  });

  function onToggleToolDialog() {
    toolDialogToggle.toggle();
  }

  function onChangeColumns(cols: GridColDef<ICourseEntity>[]) {
    updateColumns(cols);
  }

  const handleSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedImages = selectedRows.map((row: ICourseEntity) => row);
    onSelectionChanged?.(selectedImages);
  };

  return (
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
      {openStateDialog && selectCourse && (
        <CourseStateDialog
          courseId={selectCourse}
          state={stateCourse}
          onClose={() => openStateDialogAction.setLeft()}
        />
      )}
    </div>
  );
}

export default CourseTable;
