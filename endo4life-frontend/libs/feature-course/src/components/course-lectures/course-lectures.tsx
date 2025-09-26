import { IFilter } from '@endo4life/types';
import {
  CourseSectionCreateDialog,
  CourseSectionDeleteMultipleConfirmDialog,
  CourseSectionDeleteMultipleDisplay,
  CourseSectionFilter,
  CourseSectionTable,
  ICourseSectionEntity,
  useCourseSectionFilter,
  useCourseSections,
  useDeleteCourseSections,
} from '@endo4life/feature-course-section';
import { IFilterSort } from '@endo4life/types';
import { Button, Pagination } from '@endo4life/ui-common';
import { SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useDeepCompareEffect, useToggle } from 'ahooks';
import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import { VscAdd } from 'react-icons/vsc';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { loadCourseLecturesAsync } from '../../store/course-lectures/thunks/load-course-lectures.thunk';
import { CourseLectureTestModal } from './course-lecture-test';
import { CourseLectureDetailModal } from './course-lecture-detail';

enum ViewModeEnum {
  LECTURE = 'LECTURE',
  EXAM = 'EXAM',
}
interface Props {
  filter?: IFilter;
}
export function CourseLectures({}: Props) {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const gridRef = useRef<AgGridReact>(null);
  const { filter, updateFilter } = useCourseSectionFilter(courseId);
  const { data, loading, pagination } = useCourseSections(filter);
  const dispatch = useAppDispatch();
  const [selectedLectures, setSelectedCourseLectures] = useState<
    ICourseSectionEntity[]
  >([]);
  const [isDeleteDialogOpen, deleteDialogToggle] = useToggle(false);
  const [openCreateDialog, openCreateDialogAction] = useToggle(false);
  const { mutation: deleteCourseSectionsMutation } = useDeleteCourseSections();
  const [searchParams, setSearchParams] = useSearchParams();

  const lectureId = useMemo(() => {
    return searchParams.get('lectureId');
  }, [searchParams]);

  const type = useMemo(() => {
    const item = searchParams.get('type');
    return item || ViewModeEnum.LECTURE;
  }, [searchParams]);

  const selectTab = (tabId: ViewModeEnum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', tabId.toString());
    setSearchParams(newParams);
  };

  const handleCloseCourseLecture = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('lectureId');
    setSearchParams(newParams);
  };

  const handleClearSelection = () => {
    setSelectedCourseLectures([]);
    gridRef.current?.api.deselectAll();
  };

  const openDeleteDialog = () => {
    deleteDialogToggle.setRight();
  };

  const closeDeleteDialog = () => {
    deleteDialogToggle.setLeft();
  };

  const handlePageChange = (page: number) => {
    const courserFilter = new CourseSectionFilter(filter);
    courserFilter.setPage(page);
    updateFilter(courserFilter.toFilter());
  };

  const handlePageSizeChange = (size: number) => {
    const courserFilter = new CourseSectionFilter(filter);
    courserFilter.setPage(0);
    courserFilter.setPageSize(size);
    updateFilter(courserFilter.toFilter());
  };

  const onSortChange = useCallback(
    (e: SortChangedEvent) => {
      const colsState = e.api.getColumnState();

      const newFilter = new CourseSectionFilter(filter);
      let sort: IFilterSort | undefined = undefined;
      for (const col of colsState ?? []) {
        if (col.sort) {
          sort = {
            field: col.colId,
            order: col.sort.toUpperCase(),
          };
          break;
        }
      }
      newFilter.setSort(sort?.field, sort?.order);
      updateFilter(newFilter.toFilter());
    },
    [filter, updateFilter],
  );

  useDeepCompareEffect(() => {
    if (filter && courseId) {
      dispatch(loadCourseLecturesAsync({ courseId, filter }));
    }
  }, [courseId, filter, dispatch]);

  return (
    <div className="h-full p-2 bg-white rounded-b-2xl border-slate-100">
      <div className="flex items-center gap-4 p-2">
        <div className="flex items-center flex-none gap-2 p-2">
          <button
            onClick={() => selectTab(ViewModeEnum.LECTURE)}
            className={clsx('px-4 py-2 text-sm rounded-full font-medium', {
              'text-white bg-primary': type === ViewModeEnum.LECTURE,
            })}
          >
            Bài giảng
          </button>
          <button
            onClick={() => selectTab(ViewModeEnum.EXAM)}
            className={clsx('px-4 py-2 text-sm rounded-full font-medium', {
              'text-white bg-primary': type === ViewModeEnum.EXAM,
            })}
          >
            Câu hỏi ôn tập
          </button>
        </div>
        <span className="flex-auto" />
        {type === ViewModeEnum.LECTURE && (
          <Button
            className="text-sm"
            variant="outline"
            text="Thêm bài giảng"
            onClick={openCreateDialogAction.toggle}
            startIcon={<VscAdd size={16} className="flex-none" />}
          />
        )}
      </div>
      <div className="flex flex-col flex-auto w-full h-1 px-2">
        {!!selectedLectures.length && (
          <CourseSectionDeleteMultipleDisplay
            selectedCount={selectedLectures.length}
            onDelete={openDeleteDialog}
            onClearSelection={handleClearSelection}
            isLoading={deleteCourseSectionsMutation.isLoading}
          />
        )}
        <CourseSectionTable
          gridRef={gridRef}
          loading={loading}
          data={data ?? []}
          onSortChange={onSortChange}
          onDeselectAll={handleClearSelection}
          onSelectionChanged={setSelectedCourseLectures}
        />
        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
        {isDeleteDialogOpen && (
          <CourseSectionDeleteMultipleConfirmDialog
            courseSections={selectedLectures as ICourseSectionEntity[]}
            onClose={closeDeleteDialog}
          />
        )}
        {openCreateDialog && (
          <CourseSectionCreateDialog
            onClose={() => openCreateDialogAction.setLeft()}
          />
        )}
      </div>
      {!loading && type === ViewModeEnum.EXAM && lectureId && (
        <CourseLectureTestModal
          open={!!lectureId}
          onClose={handleCloseCourseLecture}
          courseId={courseId}
          lectureId={lectureId}
        />
      )}
      {!loading && type === ViewModeEnum.LECTURE && lectureId && (
        <CourseLectureDetailModal
          open={!!lectureId}
          onClose={handleCloseCourseLecture}
          courseId={courseId}
          lectureId={lectureId}
        />
      )}
    </div>
  );
}
