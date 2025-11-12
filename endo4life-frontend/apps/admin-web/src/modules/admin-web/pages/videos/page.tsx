import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  IVideoEntity,
  VideoDeleteMultipleConfirmDialog,
  VideoDeleteMultipleDisplay,
  VideoFilter,
  VideoFilterDisplay,
  VideoFilters,
  VideoTable,
  REACT_QUERY_KEYS,
  useDeleteVideos,
  useVideoFilter,
  useVideos,
} from '@endo4life/feature-videos';
import { IFilterSort } from '@endo4life/types';
import {
  Button,
  PageHeader,
  Pagination,
} from '@endo4life/ui-common';
import { IconButton, Tooltip } from '@mui/material';
import { SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useToggle } from 'ahooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CiImport } from 'react-icons/ci';
import { PiUpload } from 'react-icons/pi';
import { VscAdd, VscRefresh } from 'react-icons/vsc';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export default function VideosPage() {
  const { t } = useTranslation(['common', 'video']);
  const { filter, updateFilter } = useVideoFilter();
  const { data, loading, pagination } = useVideos(filter);
  const { mutation: deleteVideosMutation } = useDeleteVideos();
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const client = useQueryClient();
  const [isResourceTypeSet, setIsResourceTypeSet] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<IVideoEntity[]>([]);
  const [isDeleteDialogOpen, deleteDialogToggle] = useToggle(false);

  const handlePageChange = (page: number) => {
    const videoFilter = new VideoFilter(filter);
    videoFilter.setPage(page);
    updateFilter(videoFilter.toFilter());
  };

  const handlePageSizeChange = (size: number) => {
    const videoFilter = new VideoFilter(filter);
    videoFilter.setPage(0);
    videoFilter.setPageSize(size);
    updateFilter(videoFilter.toFilter());
  };

  const handleResourceTypeVideoChange = useCallback(
    (resourceType: string) => {
      const videoFilter = new VideoFilter(filter);
      videoFilter.setQuery('resourceType', resourceType);
      updateFilter(videoFilter.toFilter());
      setIsResourceTypeSet(true);
    },
    [filter, updateFilter],
  );

  const onSortChange = useCallback(
    (e: SortChangedEvent) => {
      const colsState = e.api.getColumnState();

      const newFilter = new VideoFilter(filter);
      let sort: IFilterSort | undefined = undefined;
      for (const col of colsState ?? []) {
        if (col.sort) {
          const backendField =
            col.colId === 'updatedAt' ? 'createdAt' : (col.colId as string);
          sort = {
            field: backendField,
            order: col.sort.toUpperCase(),
          };
        }
      }
      newFilter.setPage(0);
      newFilter.setSort(sort?.field, sort?.order);
      updateFilter(newFilter.toFilter());
    },
    [filter, updateFilter],
  );

  const handleClearSelection = () => {
    setSelectedVideos([]);
    gridRef.current?.api.deselectAll();
  };

  const openDeleteDialog = () => {
    deleteDialogToggle.setRight();
  };

  const closeDeleteDialog = () => {
    deleteDialogToggle.setLeft();
  };

  useEffect(() => {
    if (data && !isResourceTypeSet) {
      client.invalidateQueries([REACT_QUERY_KEYS.VIDEOS]);
      handleResourceTypeVideoChange('VIDEO');
    }
  }, [data, client, isResourceTypeSet, handleResourceTypeVideoChange]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t('video:txtVideoManagement')}
        titleAction={
          <Tooltip title={t('common:txtRefresh')}>
            <span>
              <IconButton
                size="small"
                disabled={loading}
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  client.invalidateQueries([REACT_QUERY_KEYS.VIDEOS]);
                }}
              >
                <VscRefresh size={18} />
              </IconButton>
            </span>
          </Tooltip>
        }
        leading={
          <div className="flex items-center gap-8">
            <Button
              text={t('video:leading.txtExport')}
              variant="link"
              textClassName="hidden lg:block"
            >
              <PiUpload size={18} />
            </Button>
            <Button
              textClassName="hidden lg:block"
              text={t('video:leading.txtImport')}
              variant="link"
              onClick={() => {
                navigate(ADMIN_WEB_ROUTES.VIDEO_IMPORT);
              }}
            >
              <CiImport size={18} />
            </Button>
            <Button
              textClassName="hidden lg:block"
              text={t('video:leading.txtAddVideo')}
              onClick={() => {
                navigate(ADMIN_WEB_ROUTES.VIDEO_CREATE);
              }}
            >
              <VscAdd size={16} />
            </Button>
          </div>
        }
      />
      <div className="flex flex-col flex-auto w-full h-1 px-5 overflow-y-auto">
        <VideoFilters filter={filter} onChange={updateFilter} />
        <VideoFilterDisplay filter={filter} />
        {!!selectedVideos.length && (
          <VideoDeleteMultipleDisplay
            selectedCount={selectedVideos.length}
            onDelete={openDeleteDialog}
            onClearSelection={handleClearSelection}
            isLoading={deleteVideosMutation.isLoading}
          />
        )}
        <VideoTable
          gridRef={gridRef}
          loading={loading}
          data={data ?? []}
          onSelectionChanged={setSelectedVideos}
          onSortChange={onSortChange}
        />
        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
        {isDeleteDialogOpen && (
          <VideoDeleteMultipleConfirmDialog
            videos={selectedVideos as IVideoEntity[]}
            onClose={closeDeleteDialog}
          />
        )}
      </div>
    </div>
  );
}
