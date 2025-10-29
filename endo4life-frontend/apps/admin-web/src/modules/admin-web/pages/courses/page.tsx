import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  CourseDeleteMultipleDisplay,
  CourseFilter,
  CourseFilters,
  CourseTable,
  ICourseEntity,
  REACT_QUERY_KEYS,
  useCourseFilter,
  useCourses,
  useDeleteCourses,
  CourseDeleteMultipleConfirmDialog,
} from '@endo4life/feature-course';
import { IFilterSort } from '@endo4life/types';
import { Button, PageHeader, Pagination } from '@endo4life/ui-common';
import { formatNumber, localUuid } from '@endo4life/util-common';
import { IconButton, Tooltip } from '@mui/material';
import { SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useToggle } from 'ahooks';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CiImport } from 'react-icons/ci';
import { VscAdd, VscRefresh } from 'react-icons/vsc';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export default function CoursesPage() {
  const { t } = useTranslation(['common', 'course']);
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const client = useQueryClient();
  const { filter, updateFilter } = useCourseFilter();
  const { data, loading, pagination } = useCourses(filter);
  const [selectedCourses, setSelectedCourses] = useState<ICourseEntity[]>([]);
  const [isDeleteDialogOpen, deleteDialogToggle] = useToggle(false);
  const { mutation: deleteCoursesMutation } = useDeleteCourses();

  const handleClearSelection = () => {
    setSelectedCourses([]);
    gridRef.current?.api.deselectAll();
  };

  const openDeleteDialog = () => {
    deleteDialogToggle.setRight();
  };

  const closeDeleteDialog = () => {
    deleteDialogToggle.setLeft();
  };

  const handlePageChange = (page: number) => {
    const courserFilter = new CourseFilter(filter);
    courserFilter.setPage(page);
    updateFilter(courserFilter.toFilter());
  };

  const handlePageSizeChange = (size: number) => {
    const courserFilter = new CourseFilter(filter);
    courserFilter.setPage(0);
    courserFilter.setPageSize(size);
    updateFilter(courserFilter.toFilter());
  };

  const onSortChange = useCallback(
    (e: SortChangedEvent) => {
      const colsState = e.api.getColumnState();

      const newFilter = new CourseFilter(filter);
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

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t('course:txtCourseManagement')}
        titleAction={
          <Tooltip title="Tải lại">
            <span>
              <IconButton
                size="small"
                disabled={loading}
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  client.invalidateQueries([REACT_QUERY_KEYS.COURSES]);
                }}
              >
                <VscRefresh size={18} />
              </IconButton>
            </span>
          </Tooltip>
        }
        description={
          pagination && (
            <span>
              <strong className="pr-1">
                {formatNumber(pagination?.totalCount)}
              </strong>
              <span>{t('course:courseTable.course')}</span>
            </span>
          )
        }
        leading={
          <div className="flex items-center gap-4">
            <Button
              text={t('course:leading.txtImport')}
              variant="link"
              onClick={() => {
                navigate(ADMIN_WEB_ROUTES.IMAGE_IMPORT);
              }}
            >
              <CiImport size={18} />
            </Button>
            <Button
              text={t('course:leading.txtAddCourse')}
              onClick={() => {
                navigate(
                  ADMIN_WEB_ROUTES.COURSE_DETAIL.replace(':id', localUuid()),
                );
              }}
            >
              <VscAdd size={16} />
            </Button>
          </div>
        }
      />
      <div className="flex flex-col flex-auto w-full h-1 px-5 overflow-y-auto">
        <CourseFilters filter={filter} onChange={updateFilter} />
        {!!selectedCourses.length && (
          <CourseDeleteMultipleDisplay
            selectedCount={selectedCourses.length}
            onDelete={openDeleteDialog}
            onClearSelection={handleClearSelection}
            isLoading={deleteCoursesMutation.isLoading}
          />
        )}
        <CourseTable
          gridRef={gridRef}
          loading={loading}
          data={data ?? []}
          onSortChange={onSortChange}
          onDeselectAll={handleClearSelection}
          onSelectionChanged={setSelectedCourses}
        />
        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
        {isDeleteDialogOpen && (
          <CourseDeleteMultipleConfirmDialog
            courses={selectedCourses as ICourseEntity[]}
            onClose={closeDeleteDialog}
          />
        )}
      </div>
    </div>
  );
}
