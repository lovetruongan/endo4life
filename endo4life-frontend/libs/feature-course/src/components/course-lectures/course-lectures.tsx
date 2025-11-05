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
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useToggle } from 'ahooks';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VscAdd } from 'react-icons/vsc';
import {
  useNavigate,
  useParams,
  useSearchParams,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { loadCourseLecturesAsync } from '../../store/course-lectures/thunks/load-course-lectures.thunk';
import { CourseLectureDetailModal } from './course-lecture-detail';

interface Props {
  filter?: IFilter;
}
export function CourseLectures(_props: Props) {
  const { id: courseId = '' } = useParams<{ id: string; lectureId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [showRecapQuestions, setShowRecapQuestions] = useState(false);

  const lectureIdFromParams = useMemo(() => {
    return searchParams.get('lectureId');
  }, [searchParams]);

  // Check if we're on a child route (recap-question or contents page)
  const isChildRoute = useMemo(() => {
    return (
      location.pathname.includes('/recap-question') ||
      location.pathname.includes('/contents')
    );
  }, [location.pathname]);

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

  useEffect(() => {
    if (filter && courseId) {
      dispatch(loadCourseLecturesAsync({ courseId, filter }));
    }
  }, [courseId, filter, dispatch]);

  // If on child route (recap-question or contents), render the child route
  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="h-full p-2 bg-white rounded-b-2xl border-slate-100">
      <div className="flex items-center gap-4 p-2">
        <div className="flex items-center flex-none gap-2 p-2">
          <button
            onClick={() => setShowRecapQuestions(false)}
            className={clsx('px-4 py-2 text-sm rounded-full font-medium', {
              'text-white bg-primary': !showRecapQuestions,
            })}
          >
            Bài giảng
          </button>
          <button
            onClick={() => setShowRecapQuestions(true)}
            className={clsx('px-4 py-2 text-sm rounded-full font-medium', {
              'text-white bg-primary': showRecapQuestions,
            })}
          >
            Câu hỏi ôn tập
          </button>
        </div>
        <span className="flex-auto" />
        {!showRecapQuestions && (
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
        {!showRecapQuestions && (
          <>
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
          </>
        )}
        {showRecapQuestions && !loading && data && data.length > 0 && (
          <div className="p-4 text-center text-gray-600">
            <p className="mb-4">
              Chọn một bài giảng để quản lý câu hỏi ôn tập:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((lecture) => (
                <button
                  key={lecture.id}
                  onClick={() => {
                    navigate(
                      ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES_RECAP_QUESTION.replace(
                        ':id',
                        courseId,
                      ).replace(':lectureId', lecture.id),
                    );
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors text-left"
                >
                  <h3 className="font-medium text-gray-900">{lecture.title}</h3>
                  {lecture.state && (
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {lecture.state}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {!loading && !showRecapQuestions && lectureIdFromParams && (
        <CourseLectureDetailModal
          open={!!lectureIdFromParams}
          onClose={handleCloseCourseLecture}
          courseId={courseId}
          lectureId={lectureIdFromParams}
        />
      )}
    </div>
  );
}
