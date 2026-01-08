import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  IUserEntity,
  REACT_QUERY_KEYS,
  UserDeleteMultipleConfirmDialog,
  UserDeleteMultipleDisplay,
  UserFilter,
  UserFilters,
  UserInviteDialog,
  UserTable,
  useUserFilter,
  useUsers,
} from '@endo4life/feature-user';
import { IFilterSort } from '@endo4life/types';
import {
  Button,
  PageHeader,
  Pagination,
} from '@endo4life/ui-common';
import { formatNumber } from '@endo4life/util-common';
import { IconButton, Tooltip } from '@mui/material';
import { SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useToggle } from 'ahooks';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuSendHorizonal } from 'react-icons/lu';
import { PiUpload } from 'react-icons/pi';
import { VscAdd, VscRefresh } from 'react-icons/vsc';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export default function UsersPage() {
  const { t } = useTranslation(['common', 'user']);
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const client = useQueryClient();
  const { filter, updateFilter } = useUserFilter();
  const { data, loading, pagination } = useUsers(filter);
  const [openInviteDialog, openInviteDialogAction] = useToggle(false);
  const [selectedUsers, setSelectedUsers] = useState<IUserEntity[]>([]);
  const [isDeleteDialogOpen, deleteDialogToggle] = useToggle(false);

  const handlePageChange = (page: number) => {
    const userFilter = new UserFilter(filter);
    userFilter.setPage(page);
    updateFilter(userFilter.toFilter());
  };

  const handlePageSizeChange = (size: number) => {
    const userFilter = new UserFilter(filter);
    userFilter.setPage(0);
    userFilter.setPageSize(size);
    updateFilter(userFilter.toFilter());
  };

  const onSortChange = useCallback(
    (e: SortChangedEvent) => {
      const colsState = e.api.getColumnState();

      const newFilter = new UserFilter(filter);
      let sort: IFilterSort | undefined = undefined;
      for (const col of colsState ?? []) {
        if (col.sort) {
          sort = {
            field: col.colId,
            order: col.sort.toUpperCase(),
          };
        }
      }
      newFilter.setSort(sort?.field, sort?.order);
      updateFilter(newFilter.toFilter());
    },
    [filter, updateFilter],
  );

  const handleClearSelection = () => {
    setSelectedUsers([]);
    gridRef.current?.api.deselectAll();
  };

  const openDeleteDialog = () => {
    deleteDialogToggle.setRight();
  };

  const handleCloseConfirmDeleteDialog = () => {
    deleteDialogToggle.setLeft();
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t('user:txtUserManagement')}
        titleAction={
          <Tooltip title={t('common:txtRefresh')} arrow>
            <span>
              <IconButton
                size="small"
                disabled={loading}
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  client.invalidateQueries([REACT_QUERY_KEYS.USERS]);
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
              <span>{t('user:userTable.txtUserCount')}</span>
            </span>
          )
        }
        leading={
          <div className="flex items-center gap-4">
            <Button
              textClassName="hidden md:block"
              text={t('user:leading.txtExport')}
              variant="link"
            >
              <PiUpload size={18} />
            </Button>

            <Button
              text={t('user:leading.txtInviteUser')}
              textClassName="hidden md:block"
              variant="outline"
              onClick={() => openInviteDialogAction.toggle()}
            >
              <LuSendHorizonal size={18} />
            </Button>

            <Button
              text={t('user:leading.txtAddUser')}
              textClassName="hidden md:block"
              onClick={() => {
                navigate(ADMIN_WEB_ROUTES.USER_CREATE);
              }}
            >
              <VscAdd size={16} />
            </Button>
          </div>
        }
      />
      <div className="flex flex-col flex-auto w-full h-1 px-5 overflow-y-auto">
        <UserFilters filter={filter} onChange={updateFilter} />
        {!!selectedUsers.length && (
          <UserDeleteMultipleDisplay
            selectedCount={selectedUsers.length}
            onDelete={openDeleteDialog}
            onClearSelection={handleClearSelection}
          />
        )}
        <UserTable
          gridRef={gridRef}
          loading={loading}
          data={data ?? []}
          onSelectionChanged={setSelectedUsers}
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
        {openInviteDialog && (
          <UserInviteDialog onClose={() => openInviteDialogAction.setLeft()} />
        )}
        {isDeleteDialogOpen && (
          <UserDeleteMultipleConfirmDialog
            users={selectedUsers as IUserEntity[]}
            onClose={handleCloseConfirmDeleteDialog}
          />
        )}
      </div>
    </div>
  );
}
