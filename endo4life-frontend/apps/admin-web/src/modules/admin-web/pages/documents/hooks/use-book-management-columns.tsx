import { useMemo, useState } from 'react';
import { GridColDef } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
import { ICellRendererParams } from 'ag-grid-community';
import { IBookEntity } from '../types';
import { IoDocumentTextOutline, IoTrashOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import { stringUtils, formatDate } from '@endo4life/util-common';
import { IconButton, Tooltip } from '@mui/material';

interface IBookManagementColumnsProps {
  openToolDialog?: boolean;
  onToggleToolDialog?: () => void;
  onEdit: (book: IBookEntity) => void;
  onDelete: (book: IBookEntity) => void;
}

function useBookManagementColumns({
  openToolDialog,
  onToggleToolDialog,
  onEdit,
  onDelete,
}: IBookManagementColumnsProps) {
  const { t } = useTranslation('common');

  const bookColumns: GridColDef<IBookEntity>[] = useMemo(() => {
    const cols = [
      {
        id: 1,
        colId: 'coverUrl',
        field: 'coverUrl',
        headerName: 'Ảnh bìa',
        hide: false,
        initialFlex: 0.15,
        minWidth: 80,
        maxWidth: 80,
        pinned: 'left',
        sortable: false,
        cellRenderer: (params: ICellRendererParams<IBookEntity>) => (
          <div className="flex items-center justify-center h-full">
            {params?.data?.coverUrl ? (
              <img
                src={params?.data?.coverUrl}
                alt={params?.data?.title || 'Book cover'}
                className="object-cover w-10 h-14 my-1 rounded shadow-sm"
              />
            ) : (
              <div className="flex items-center justify-center w-10 h-14 my-1 rounded bg-gray-100 text-gray-400">
                <IoDocumentTextOutline size={20} />
              </div>
            )}
          </div>
        ),
      },
      {
        id: 2,
        colId: 'title',
        field: 'title',
        headerName: 'Tiêu đề',
        hide: false,
        initialFlex: 0.35,
        minWidth: 150,
        comparator: (valueA: string, valueB: string) => {
          const a = (valueA ?? '').toString();
          const b = (valueB ?? '').toString();
          return a.localeCompare(b, undefined, { sensitivity: 'base' });
        },
        cellRenderer: (params: ICellRendererParams<IBookEntity>) => (
          <div className="flex flex-col justify-center h-full">
            <p className="font-medium text-gray-900 truncate">
              {params?.data?.title}
            </p>
            {params?.data?.description && (
              <p className="text-xs text-gray-500 truncate">
                {params?.data?.description}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 3,
        colId: 'author',
        field: 'author',
        headerName: 'Tác giả',
        hide: false,
        initialFlex: 0.25,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<IBookEntity>) => (
          <div className="flex items-center h-full">
            <span className="text-gray-600">
              {params?.data?.author || '---'}
            </span>
          </div>
        ),
      },
      {
        id: 4,
        colId: 'createdAt',
        field: 'createdAt',
        headerName: 'Ngày tạo',
        hide: false,
        initialFlex: 0.2,
        minWidth: 100,
        cellRenderer: (params: ICellRendererParams<IBookEntity>) => {
          const date = params?.data?.createdAt;
          return (
            <div className="flex items-center h-full">
              <span className="text-gray-500 text-sm">
                {date ? formatDate(date) : '---'}
              </span>
            </div>
          );
        },
      },
      {
        id: 5,
        colId: 'actions',
        field: 'actions',
        headerName: 'Hành động',
        hide: false,
        initialFlex: 0.15,
        minWidth: 100,
        maxWidth: 100,
        pinned: 'right',
        sortable: false,
        cellRenderer: (params: ICellRendererParams<IBookEntity>) => (
          <div className="flex items-center justify-center h-full gap-1">
            <Tooltip title="Chỉnh sửa" arrow>
              <IconButton
                size="small"
                onClick={() => params?.data && onEdit(params.data)}
                className="text-blue-600 hover:bg-blue-50"
              >
                <FiEdit2 size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xoá" arrow>
              <IconButton
                size="small"
                onClick={() => params?.data && onDelete(params.data)}
                className="text-red-600 hover:bg-red-50"
              >
                <IoTrashOutline size={16} />
              </IconButton>
            </Tooltip>
          </div>
        ),
      },
    ] as GridColDef<IBookEntity>[];

    cols.forEach((col) => {
      col.headerComponentParams = {
        openToolDialog,
        onToggleToolDialog,
      };
    });

    return cols;
  }, [t, onEdit, onDelete, openToolDialog, onToggleToolDialog]);

  const [columns, setColumns] = useState(bookColumns);

  const updateColumns = (cols: GridColDef<IBookEntity>[]) => {
    setColumns(cols);
  };

  return {
    columns,
    updateColumns,
  };
}

export { useBookManagementColumns };

