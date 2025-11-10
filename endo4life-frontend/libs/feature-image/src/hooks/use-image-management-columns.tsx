import { useMemo, useState } from 'react';
import { GridColDef } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
import { ICellRendererParams } from 'ag-grid-community';
import { ImageActionsCell } from '../components/image-table/image-actions-cell';
import { ImageStatusCell } from '../components/image-table/image-status-cell';
import { IImageEntity } from '../types';
import { ImageTagsCell } from '../components/image-table/image-tags-cell';
import { IoEyeOutline } from 'react-icons/io5';
import { TfiCommentAlt } from 'react-icons/tfi';
import { Actions } from 'ahooks/lib/useToggle';
import { ResourceState } from '@endo4life/data-access';
import { Link } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { objectUtils, stringUtils, formatDate } from '@endo4life/util-common';

interface IImageManagementColumnsProps {
  openToolDialog?: boolean;
  onToggleToolDialog?: () => void;
  openStateDialogAction: Actions<boolean>;
  onSelectImage: (imageId: string) => void;
  onSetStateImage: (state: ResourceState | undefined) => void;
}

function useImageManagementColumns({
  openToolDialog,
  onToggleToolDialog,
  openStateDialogAction,
  onSelectImage,
  onSetStateImage,
}: IImageManagementColumnsProps) {
  const { t } = useTranslation('image');
  const imageColumns: GridColDef<IImageEntity>[] = useMemo(() => {
    const cols = [
      {
        id: 1,
        colId: 'thumbnailUrl',
        field: 'thumbnailUrl',
        headerName: t('basicInfo.image'),
        hide: false,
        initialFlex: 0.25,
        minWidth: 100,
        maxWidth: 100,
        pinned: 'left',
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <Link
            to={ADMIN_WEB_ROUTES.IMAGE_DETAIL.replace(
              ':id',
              stringUtils.defaultString(params?.data?.id),
            )}
          >
            <div className="flex items-center justify-center h-full">
              <img
                src={params?.data?.thumbnailUrl}
                alt={params?.data?.title || 'Image'}
                className="object-cover w-12 h-12 my-2 rounded-md"
              />
            </div>
          </Link>
        ),
      },

      {
        id: 2,
        colId: 'title',
        field: 'title',
        headerName: t('basicInfo.title'),
        hide: false,
        initialFlex: 0.35,
        minWidth: 100,
        comparator: (valueA: any, valueB: any) => {
          const a = (valueA ?? '').toString();
          const b = (valueB ?? '').toString();
          return a.localeCompare(b, undefined, { sensitivity: 'base' });
        },
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <Link
            to={ADMIN_WEB_ROUTES.IMAGE_DETAIL.replace(
              ':id',
              stringUtils.defaultString(params?.data?.id),
            )}
          >
            <div className="flex items-center">
              <p className="my-2">{params?.data?.title}</p>
            </div>
          </Link>
        ),
      },
      {
        id: 3,
        colId: 'state',
        field: 'state',
        headerName: t('basicInfo.display'),
        hide: false,
        initialFlex: 0.35,
        minWidth: 80,
        // wrapHeaderText: false,
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <div
            className="flex items-center justify-start h-full"
            onClick={() => {
              onSelectImage(stringUtils.defaultString(params?.data?.id));
              onSetStateImage(params?.data?.state);
              openStateDialogAction.toggle();
            }}
          >
            <ImageStatusCell image={objectUtils.defaultObject(params?.data)} />
          </div>
        ),
      },
      {
        id: 4,
        colId: 'tag',
        field: 'tag',
        headerName: t('basicInfo.tag'),
        hide: false,
        initialFlex: 0.75,
        minWidth: 100,
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <div className="flex items-center justify-start h-full">
            <ImageTagsCell tags={params?.data?.tag || []} />
          </div>
        ),
      },
      {
        id: 5,
        colId: 'detailTag',
        field: 'detailTag',
        hide: false,
        initialFlex: 0.75,
        minWidth: 100,
        headerName: t('basicInfo.detailTag'),
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <div className="flex items-center justify-start h-full">
            <ImageTagsCell tags={params?.data?.detailTag || []} />
          </div>
        ),
      },
      {
        id: 6,
        colId: 'viewNumber',
        field: 'viewNumber',
        hide: false,
        initialFlex: 0.25,
        minWidth: 70,
        headerName: t('basicInfo.viewNumber'),
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <div className="flex items-center justify-end h-full gap-1 my-2">
            <IoEyeOutline />
            <span>{params?.data?.viewNumber ?? 0}</span>
          </div>
        ),
      },
      {
        id: 7,
        colId: 'commentCount',
        field: 'commentCount',
        hide: false,
        headerName: t('basicInfo.commentCount'),
        initialFlex: 0.25,
        minWidth: 70,
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <div className="flex items-center justify-end h-full gap-1 my-2">
            <TfiCommentAlt />
            <span>{params?.data?.commentCount ?? 0}</span>
          </div>
        ),
      },
      {
        id: 8,
        colId: 'updatedAt',
        field: 'updatedAt',
        hide: false,
        initialFlex: 0.5,
        minWidth: 100,
        headerName: t('basicInfo.updatedAt'),
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => {
          const date = params?.data?.updatedAt || params?.data?.createdAt;
          return <span className="flex">{date ? formatDate(date) : '-'}</span>;
        },
      },
      {
        id: 9,
        colId: 'metadata',
        field: 'metadata',
        hide: false,
        initialFlex: 0.1,
        headerName: t('imageTable.headerActions'),
        pinned: 'right',
        width: 50,
        maxWidth: 50,
        suppressSizeToFit: true,
        cellRenderer: (params: ICellRendererParams<IImageEntity>) => (
          <div className="flex items-center justify-center h-full">
            <ImageActionsCell
              image={objectUtils.defaultObject(params?.data)}
              hasRemoveButton={false}
            />
          </div>
        ),
      },
    ] as GridColDef<IImageEntity>[];

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
    onSelectImage,
    onSetStateImage,
    onToggleToolDialog,
    openStateDialogAction,
    openToolDialog,
  ]);

  const [columns, setColumns] = useState(imageColumns);

  const updateColumns = (cols: GridColDef<IImageEntity>[]) => {
    setColumns(cols);
  };

  return {
    columns,
    updateColumns,
  };
}

export { useImageManagementColumns };
