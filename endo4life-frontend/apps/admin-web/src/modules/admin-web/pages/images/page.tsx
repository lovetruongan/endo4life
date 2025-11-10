import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  IImageEntity,
  ImageDeleteMultipleConfirmDialog,
  ImageDeleteMultipleDisplay,
  ImageFilter,
  ImageFilterDisplay,
  ImageFilters,
  ImageTable,
  REACT_QUERY_KEYS,
  useDeleteImages,
  useImageFilter,
  useImages,
} from '@endo4life/feature-image';
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

export default function ImagesPage() {
  const { t } = useTranslation(['common', 'image']);
  const { filter, updateFilter } = useImageFilter();
  const { data, loading, pagination } = useImages(filter);
  const { mutation: deleteImagesMutation } = useDeleteImages();
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const client = useQueryClient();
  const [isResourceTypeSet, setIsResourceTypeSet] = useState(false);
  const [selectedImages, setSelectedImages] = useState<IImageEntity[]>([]);
  const [isDeleteDialogOpen, deleteDialogToggle] = useToggle(false);

  const handlePageChange = (page: number) => {
    const imageFilter = new ImageFilter(filter);
    imageFilter.setPage(page);
    updateFilter(imageFilter.toFilter());
  };

  const handlePageSizeChange = (size: number) => {
    const imageFilter = new ImageFilter(filter);
    imageFilter.setPage(0);
    imageFilter.setPageSize(size);
    updateFilter(imageFilter.toFilter());
  };

  const handleResourceTypeImageChange = useCallback(
    (resourceType: string) => {
      const imageFilter = new ImageFilter(filter);
      imageFilter.setQuery('resourceType', resourceType);
      updateFilter(imageFilter.toFilter());
      setIsResourceTypeSet(true);
    },
    [filter, updateFilter],
  );

  const onSortChange = useCallback(
    (e: SortChangedEvent) => {
      const colsState = e.api.getColumnState();

      const newFilter = new ImageFilter(filter);
      let sort: IFilterSort | undefined = undefined;
      for (const col of colsState ?? []) {
        if (col.sort) {
          // Map UI column ids to backend sort fields when needed
          const backendField =
            col.colId === 'updatedAt' ? 'createdAt' : (col.colId as string);
          sort = {
            field: backendField,
            order: col.sort.toUpperCase(),
          };
        }
      }
      // Reset to first page on sort change to avoid out-of-range pages
      newFilter.setPage(0);
      // Clear sort if none selected; otherwise apply mapped sort
      newFilter.setSort(sort?.field, sort?.order);
      updateFilter(newFilter.toFilter());
    },
    [filter, updateFilter],
  );

  const handleClearSelection = () => {
    setSelectedImages([]);
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
      client.invalidateQueries([REACT_QUERY_KEYS.IMAGES]);
      handleResourceTypeImageChange('IMAGE');
    }
  }, [data, client, isResourceTypeSet, handleResourceTypeImageChange]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t('image:txtImageManagement')}
        titleAction={
          <Tooltip title={t('common:txtRefresh')}>
            <span>
              <IconButton
                size="small"
                disabled={loading}
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  client.invalidateQueries([REACT_QUERY_KEYS.IMAGES]);
                }}
              >
                <VscRefresh size={18} />
              </IconButton>
            </span>
          </Tooltip>
        }
        leading={
          <div className="flex items-center gap-4 lg:gap-8">
            <Button
              text={t('image:leading.txtExport')}
              textClassName="hidden lg:block"
              variant="link"
            >
              <PiUpload size={18} />
            </Button>
            <Button
              textClassName="hidden lg:block"
              text={t('image:leading.txtImport')}
              variant="link"
              onClick={() => {
                navigate(ADMIN_WEB_ROUTES.IMAGE_IMPORT);
              }}
            >
              <CiImport size={18} />
            </Button>
            <Button
              textClassName="hidden lg:block"
              text={t('image:leading.txtAddImage')}
              onClick={() => {
                navigate(ADMIN_WEB_ROUTES.IMAGE_CREATE);
              }}
            >
              <VscAdd size={16} />
            </Button>
          </div>
        }
      />
      <div className="flex flex-col flex-auto w-full h-1 px-5 overflow-y-auto">
        <ImageFilters filter={filter} onChange={updateFilter} />
        <ImageFilterDisplay filter={filter} />
        {!!selectedImages.length && (
          <ImageDeleteMultipleDisplay
            selectedCount={selectedImages.length}
            onDelete={openDeleteDialog}
            onClearSelection={handleClearSelection}
            isLoading={deleteImagesMutation.isLoading}
          />
        )}
        <ImageTable
          gridRef={gridRef}
          loading={loading}
          data={data ?? []}
          onSelectionChanged={setSelectedImages}
          onSortChange={onSortChange}
          onDeselectAll={handleClearSelection}
        />
        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
        {isDeleteDialogOpen && (
          <ImageDeleteMultipleConfirmDialog
            images={selectedImages as IImageEntity[]}
            onClose={closeDeleteDialog}
          />
        )}
      </div>
    </div>
  );
}
