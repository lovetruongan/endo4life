import { useMemo, useState } from 'react';
import { GridColDef } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
import { ICellRendererParams } from 'ag-grid-community';
import { CourseActionsCell } from '../components/course-table/course-actions-cell';
import { CourseStatusCell } from '../components/course-table/course-status-cell';
import { ICourseEntity } from '../types';
import { Actions } from 'ahooks/lib/useToggle';
import { CourseState } from '@endo4life/data-access';
import { Link } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  enumUtils,
  formatDate,
  objectUtils,
  stringUtils,
} from '@endo4life/util-common';

interface ICourseManagementColumnsProps {
  openToolDialog?: boolean;
  onToggleToolDialog?: () => void;
  openStateDialogAction: Actions<boolean>;
  onSelectCourse: (imageId: string) => void;
  onSetStateCourse: (state: CourseState | undefined) => void;
}

function useCourseManagementColumns({
  openToolDialog,
  onToggleToolDialog,
  openStateDialogAction,
  onSelectCourse,
  onSetStateCourse,
}: ICourseManagementColumnsProps) {
  const { t } = useTranslation('course');
  const userColumns: GridColDef<ICourseEntity>[] = useMemo(() => {
    const cols = [
      {
        id: 0,
        colId: 'thumbnail',
        field: 'thumbnail',
        headerName: t('courseTable.course'),
        hide: false,
        initialFlex: 0.25,
        cellRenderer: (params: ICellRendererParams<ICourseEntity>) => (
          <Link
            to={ADMIN_WEB_ROUTES.COURSE_DETAIL.replace(
              ':id',
              stringUtils.defaultString(params?.data?.id),
            )}
          >
            <div className="flex items-center justify-center h-full">
              <img
                src={params?.data?.thumbnail?.src}
                alt={params?.data?.title || 'Course'}
                className="object-cover w-12 h-12 my-2 rounded-md"
              />
            </div>
          </Link>
        ),
      },

      {
        id: 1,
        colId: 'title',
        field: 'title',
        headerName: t('courseTable.title'),
        hide: false,
        initialFlex: 0.5,
        cellRenderer: (params: ICellRendererParams<ICourseEntity>) => (
          <Link
            to={ADMIN_WEB_ROUTES.COURSE_DETAIL.replace(
              ':id',
              stringUtils.defaultString(params?.data?.id),
            )}
          >
            <div className="flex items-center h-full">
              <p className="my-2">{params?.data?.title}</p>
            </div>
          </Link>
        ),
      },
      {
        id: 2,
        colId: 'status',
        field: 'status',
        headerName: t('courseTable.state'),
        hide: false,
        initialFlex: 0.75,
        cellRenderer: (params: ICellRendererParams<ICourseEntity>) => (
          <div className="flex items-center justify-center h-full">
            {params?.data && (
              <CourseStatusCell
                course={objectUtils.defaultObject(params?.data)}
                openStateDialogAction={openStateDialogAction}
                onSelectCourse={onSelectCourse}
                onSetStateCourse={onSetStateCourse}
              />
            )}
          </div>
        ),
      },
      {
        id: 3,
        colId: 'updatedAt',
        field: 'updatedAt',
        hide: false,
        headerName: t('courseTable.lastUpdated'),
        cellRenderer: (params: ICellRendererParams<ICourseEntity>) => (
          <span>
            {formatDate(stringUtils.defaultString(params?.data?.updatedAt))}
          </span>
        ),
      },
      {
        id: 4,
        colId: 'metadata',
        field: 'metadata',
        hide: false,
        headerName: t('courseTable.headerActions'),
        initialFlex: 0.5,
        cellRenderer: (params: ICellRendererParams<ICourseEntity>) => (
          <div className="flex items-center justify-center h-full">
            <CourseActionsCell
              course={objectUtils.defaultObject(params?.data)}
              hasRemoveButton={false}
            />
          </div>
        ),
      },
    ] as GridColDef<ICourseEntity>[];

    cols.map((col) => {
      col.headerComponentParams = {
        openToolDialog,
        onToggleToolDialog,
      };
      if (
        ['thumbnailUrl', 'metadata'].includes(
          stringUtils.defaultString(col.colId),
        )
      ) {
        col.sortable = false;
      }
      return col;
    });

    return cols;
  }, [
    t,
    onSelectCourse,
    onSetStateCourse,
    openStateDialogAction,
    openToolDialog,
    onToggleToolDialog,
  ]);

  const [columns, setColumns] = useState(userColumns);

  const updateColumns = (cols: GridColDef<ICourseEntity>[]) => {
    setColumns(cols);
  };

  return {
    columns,
    updateColumns,
  };
}

export { useCourseManagementColumns };
