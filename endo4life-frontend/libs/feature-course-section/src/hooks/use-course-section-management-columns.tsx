import { useMemo, useState } from 'react';
import { GridColDef } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
import { ICellRendererParams } from 'ag-grid-community';
import { CourseStatusCell } from '../components/course-section-table/course-section-status-cell';
import { Actions } from 'ahooks/lib/useToggle';
import { CourseState } from '@endo4life/data-access';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { formatDate } from '@endo4life/util-common';
import { ICourseSectionEntity } from '../types';
import { CourseActionsCell } from '../components/course-section-table/course-section-actions-cell';

interface ICourseSectionManagementColumnsProps {
  openToolDialog?: boolean;
  onToggleToolDialog?: () => void;
  openStateDialogAction: Actions<boolean>;
  onSelectCourse: (imageId: string) => void;
  onSetStateCourse: (state: CourseState | undefined) => void;
}

function useCourseSectionManagementColumns({
  openToolDialog,
  onToggleToolDialog,
  openStateDialogAction,
  onSelectCourse,
  onSetStateCourse,
}: ICourseSectionManagementColumnsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id: courseId = '' } = useParams<{ id: string }>();
  const { t } = useTranslation('course');
  const userColumns: GridColDef<ICourseSectionEntity>[] = useMemo(() => {
    const cols = [
      {
        id: 0,
        colId: 'thumbnailUrl',
        field: 'thumbnailUrl',
        headerName: t('courseSectionTable.course'),
        hide: false,
        initialFlex: 0.25,
        cellRenderer: (params: ICellRendererParams<ICourseSectionEntity>) => (
          <div className="flex items-center justify-center h-full">
            <img
              src={params?.data?.thumbnail?.src}
              alt={params?.data?.title || 'Course'}
              className="object-cover w-12 h-12 my-2 rounded-md"
            />
          </div>
        ),
      },

      {
        id: 1,
        colId: 'title',
        field: 'title',
        headerName: t('courseSectionTable.title'),
        hide: false,
        initialFlex: 0.5,
        cellRenderer: (params: ICellRendererParams<ICourseSectionEntity>) => {
          const lectureId = params.data?.id;
          return (
            <div
              onClick={() => {
                if (!lectureId) return;
                const newParams = new URLSearchParams(searchParams);
                newParams.set('lectureId', lectureId);
                setSearchParams(newParams);
              }}
            >
              {params?.data?.title}
            </div>
          );
        },
      },
      {
        id: 2,
        colId: 'state',
        field: 'state',
        headerName: t('courseSectionTable.state'),
        hide: false,
        initialFlex: 0.75,
        cellRenderer: (params: ICellRendererParams<ICourseSectionEntity>) => (
          <div className="flex items-center justify-center h-full">
            {params?.data && (
              <CourseStatusCell
                course={params?.data}
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
        headerName: t('courseSectionTable.lastUpdated'),
        cellRenderer: (params: ICellRendererParams<ICourseSectionEntity>) => (
          <span>
            {params?.data?.updatedAt ? formatDate(params?.data?.updatedAt) : ''}
          </span>
        ),
      },
      {
        id: 4,
        colId: 'metadata',
        field: 'metadata',
        hide: false,
        headerName: t('courseSectionTable.headerActions'),
        initialFlex: 0.5,
        cellRenderer: (params: ICellRendererParams<ICourseSectionEntity>) => (
          <div className="flex items-center justify-center h-full">
            <CourseActionsCell course={params?.data!} hasRemoveButton={false} />
          </div>
        ),
      },
    ] as GridColDef<ICourseSectionEntity>[];

    cols.map((col) => {
      col.headerComponentParams = {
        openToolDialog,
        onToggleToolDialog,
      };
      if (['thumbnailUrl', 'metadata'].includes(col.colId!)) {
        col.sortable = false;
      }
      return col;
    });

    return cols;
  }, [t]);

  const [columns, setColumns] = useState(userColumns);

  const updateColumns = (cols: GridColDef<any>[]) => {
    setColumns(cols);
  };

  return {
    columns,
    updateColumns,
  };
}

export { useCourseSectionManagementColumns };
