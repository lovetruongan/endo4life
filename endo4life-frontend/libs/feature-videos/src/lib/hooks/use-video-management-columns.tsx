import { useMemo, useState } from 'react';
import { GridColDef } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
import { ICellRendererParams } from 'ag-grid-community';
import { VideoActionsCell } from '../components/video-table/video-actions-cell';
import { VideoStatusCell } from '../components/video-table/video-status-cell';
import { IVideoEntity } from '../types';
import { VideoTagsCell } from '../components/video-table/video-tags-cell';
import { IoEyeOutline } from 'react-icons/io5';
import { TfiCommentAlt } from 'react-icons/tfi';
import { Actions } from 'ahooks/lib/useToggle';
import { ResourceState } from '@endo4life/data-access';
import { Link } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { formatVideoTime } from '../utils';
import {
  enumUtils,
  formatDate,
  numberUtils,
  objectUtils,
  stringUtils,
} from '@endo4life/util-common';

interface IVideoManagementColumnsProps {
  openToolDialog?: boolean;
  onToggleToolDialog?: () => void;
  openStateDialogAction: Actions<boolean>;
  onSelectVideo: (videoId: string) => void;
  onSetStateVideo: (state: ResourceState | undefined) => void;
}

function useVideoManagementColumns({
  openToolDialog,
  onToggleToolDialog,
  openStateDialogAction,
  onSelectVideo,
  onSetStateVideo,
}: IVideoManagementColumnsProps) {
  const { t } = useTranslation('video');

  const videoColumns: GridColDef<IVideoEntity>[] = useMemo(() => {
    const cols = [
      {
        id: 1,
        colId: 'thumbnailUrl',
        field: 'thumbnailUrl',
        headerName: t('basicInfo.video'),
        hide: false,
        flex: 0.25,
        minWidth: 100,
        maxWidth: 100,
        pinned: 'left',
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => {
          const { thumbnailUrl, id, title, time } = params?.data || {};
          const formattedTime = formatVideoTime(time || 0);

          return (
            <Link
              to={ADMIN_WEB_ROUTES.VIDEO_DETAIL.replace(
                ':id',
                stringUtils.defaultString(id),
              )}
            >
              <div className="relative w-12 h-12">
                <img
                  src={thumbnailUrl}
                  alt={title || 'Video'}
                  className="object-cover w-full h-full rounded-md"
                />
                <span className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-0.5 rounded-md">
                  {formattedTime}
                </span>
              </div>
            </Link>
          );
        },
      },

      {
        id: 2,
        colId: 'title',
        field: 'title',
        headerName: t('basicInfo.title'),
        hide: false,
        flex: 0.35,
        minWidth: 100,
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <Link
            to={ADMIN_WEB_ROUTES.VIDEO_DETAIL.replace(
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
        flex: 0.35,
        minWidth: 80,
        // wrapHeaderText: false,
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <div
            className="flex items-center justify-start h-full"
            onClick={() => {
              onSelectVideo(stringUtils.defaultString(params?.data?.id));
              onSetStateVideo(params?.data?.state);
              openStateDialogAction.toggle();
            }}
          >
            <VideoStatusCell video={objectUtils.defaultObject(params?.data)} />
          </div>
        ),
      },
      {
        id: 4,
        colId: 'tag',
        field: 'tag',
        headerName: t('basicInfo.tag'),
        hide: false,
        flex: 0.75,
        minWidth: 100,
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <div className="flex items-center justify-start h-full">
            <VideoTagsCell tags={enumUtils.defaultEnum(params?.data?.tag)} />
          </div>
        ),
      },
      {
        id: 5,
        colId: 'detailTag',
        field: 'detailTag',
        hide: false,
        flex: 0.75,
        minWidth: 100,
        headerName: t('basicInfo.detailTag'),
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <div className="flex items-center justify-start h-full">
            <VideoTagsCell
              tags={enumUtils.defaultEnum(params?.data?.detailTag)}
            />
          </div>
        ),
      },
      {
        id: 6,
        colId: 'viewNumber',
        field: 'viewNumber',
        hide: false,
        flex: 0.25,
        minWidth: 70,
        headerName: t('basicInfo.viewNumber'),
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <div className="flex items-center justify-end h-full gap-1 my-2">
            <IoEyeOutline />
            <span>{numberUtils.defaultNumber(params?.data?.viewNumber)}</span>
          </div>
        ),
      },
      {
        id: 7,
        colId: 'commentCount',
        field: 'commentCount',
        hide: false,
        headerName: t('basicInfo.commentCount'),
        flex: 0.25,
        minWidth: 70,
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <div className="flex items-center justify-end h-full gap-1 my-2">
            <TfiCommentAlt />
            <span>{numberUtils.defaultNumber(params?.data?.commentCount)}</span>
          </div>
        ),
      },
      {
        id: 8,
        colId: 'updatedAt',
        field: 'updatedAt',
        hide: false,
        flex: 0.5,
        minWidth: 100,
        headerName: t('basicInfo.updatedAt'),
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <span className="flex">{formatDate(params?.data?.updatedAt!)}</span>
        ),
      },
      {
        id: 9,
        colId: 'metadata',
        field: 'metadata',
        hide: false,
        flex: 0.1,
        headerName: t('videoTable.headerActions'),
        pinned: 'right',
        width: 50,
        maxWidth: 50,
        suppressSizeToFit: true,
        cellRenderer: (params: ICellRendererParams<IVideoEntity>) => (
          <div className="flex items-center justify-center h-full">
            <VideoActionsCell
              video={objectUtils.defaultObject(params?.data)}
              hasRemoveButton={false}
            />
          </div>
        ),
      },
    ] as GridColDef<IVideoEntity>[];

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
    openToolDialog,
    openStateDialogAction,
    onToggleToolDialog,
    onSetStateVideo,
    onSelectVideo,
  ]);

  const [columns, setColumns] = useState(videoColumns);

  const updateColumns = (cols: GridColDef<IVideoEntity>[]) => {
    setColumns(cols);
  };

  return {
    columns,
    updateColumns,
  };
}

export { useVideoManagementColumns };
