import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { AgGridReact } from 'ag-grid-react';
import { useToggle } from 'ahooks';
import { IconButton, Tooltip } from '@mui/material';
import { VscAdd, VscRefresh } from 'react-icons/vsc';
import { Button, PageHeader, Pagination } from '@endo4life/ui-common';
import { formatNumber } from '@endo4life/util-common';
import { useBooks, useBookCreate, useBookUpdate, useBookDelete } from './hooks';
import { BookTable, BookFormDialog, BookDeleteDialog } from './components';
import { IBookEntity } from './types';
import { REACT_QUERY_KEYS } from './constants';

export default function DocumentsPage() {
  const { t } = useTranslation(['common']);
  const gridRef = useRef<AgGridReact>(null);
  const client = useQueryClient();
  const { data, loading, pagination, refetch } = useBooks();
  const { mutation: createMutation } = useBookCreate();
  const { mutation: updateMutation } = useBookUpdate();
  const { mutation: deleteMutation } = useBookDelete();

  const [isFormOpen, formToggle] = useToggle(false);
  const [isDeleteOpen, deleteToggle] = useToggle(false);
  const [editingBook, setEditingBook] = useState<IBookEntity | null>(null);
  const [deletingBook, setDeletingBook] = useState<IBookEntity | null>(null);

  const handleAdd = () => {
    setEditingBook(null);
    formToggle.setRight();
  };

  const handleEdit = (book: IBookEntity) => {
    setEditingBook(book);
    formToggle.setRight();
  };

  const handleDelete = (book: IBookEntity) => {
    setDeletingBook(book);
    deleteToggle.setRight();
  };

  const handleFormSubmit = async (
    data: { title: string; author: string; description: string },
    file?: File,
    cover?: File,
  ) => {
    if (editingBook) {
      await updateMutation.mutateAsync({
        id: editingBook.id,
        title: data.title,
        author: data.author,
        description: data.description,
        file,
        cover,
      });
    } else {
      await createMutation.mutateAsync({
        title: data.title,
        author: data.author,
        description: data.description,
        file,
        cover,
      });
    }
    formToggle.setLeft();
  };

  const handleDeleteConfirm = async () => {
    if (deletingBook) {
      await deleteMutation.mutateAsync(deletingBook.id);
      deleteToggle.setLeft();
      setDeletingBook(null);
    }
  };

  const handlePageChange = (page: number) => {
    // For now, no server-side pagination
  };

  const handlePageSizeChange = (size: number) => {
    // For now, no server-side pagination
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Quản lý tài liệu"
        titleAction={
          <Tooltip title={t('common:txtRefresh')} arrow>
            <span>
              <IconButton
                size="small"
                disabled={loading}
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  client.invalidateQueries([REACT_QUERY_KEYS.BOOKS]);
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
              <strong className="pr-1">{formatNumber(pagination.totalCount)}</strong>
              <span>tài liệu</span>
            </span>
          )
        }
        leading={
          <div className="flex items-center gap-4">
            <Button
              text="Thêm tài liệu"
              textClassName="hidden md:block"
              onClick={handleAdd}
            >
              <VscAdd size={16} />
            </Button>
          </div>
        }
      />

      <div className="flex flex-col flex-auto w-full h-1 px-5 overflow-y-auto">
        <BookTable
          gridRef={gridRef}
          loading={loading}
          data={data ?? []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      <BookFormDialog
        open={isFormOpen}
        book={editingBook}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
        onClose={() => formToggle.setLeft()}
        onSubmit={handleFormSubmit}
      />

      <BookDeleteDialog
        open={isDeleteOpen}
        book={deletingBook}
        isLoading={deleteMutation.isLoading}
        onClose={() => deleteToggle.setLeft()}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
