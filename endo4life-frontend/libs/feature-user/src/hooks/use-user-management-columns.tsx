import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GridColDef, ICustomHeaderComponentParamsProps } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
import { ICellRendererParams } from 'ag-grid-community';
import { enumUtils, formatDate, formatFullName, objectUtils, stringUtils } from '@endo4life/util-common';
import { UserActionsCell } from '../components/user-table/user-actions-cell';
import { UserRoleCell } from '../components/user-table/user-role-cell';
import { UserStatusCell } from '../components/user-table/user-status-cell';
import { IUserEntity } from '../types';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';

interface IUserManagementColumnsProps
  extends ICustomHeaderComponentParamsProps {}

function useUserManagementColumns({
  openToolDialog,
  onToggleToolDialog,
}: IUserManagementColumnsProps) {
  const { t } = useTranslation('user');
  const userColumns: GridColDef<IUserEntity>[] = useMemo(() => {
    const cols = [
      {
        id: 0,
        colId: 'firstName',
        field: 'name',
        headerName: t('userTable.headerDisplayName'),
        hide: false,
        sortingOrder: ['asc', 'desc', null],
        cellRenderer: (params: ICellRendererParams<IUserEntity>) => (
          <Link to={ADMIN_WEB_ROUTES.USER_DETAIL.replace(':id', stringUtils.defaultString(params?.data?.id))}>
            {formatFullName({
              firstName: stringUtils.defaultString(params?.data?.firstName),
              lastName: stringUtils.defaultString(params?.data?.lastName),
            })}
          </Link>
        ),
      },
      {
        id: 1,
        colId: 'role',
        field: 'role',
        headerName: t('userTable.headerRole'),
        hide: false,
        initialFlex: 0.5,
        cellRenderer: (params: ICellRendererParams<IUserEntity>) => (
          <UserRoleCell user={objectUtils.defaultObject(params?.data)} />
        ),
      },
      {
        id: 2,
        colId: 'email',
        field: 'email',
        headerName: t('userTable.headerEmail'),
        hide: false,
        cellRenderer: (params: ICellRendererParams<IUserEntity>) => (
          <Link to={ADMIN_WEB_ROUTES.USER_DETAIL.replace(':id', stringUtils.defaultString(params?.data?.id))}>
            {params?.data?.email}
          </Link>
        ),
      },
      {
        id: 3,
        colId: 'phoneNumber',
        field: 'phoneNumber',
        hide: false,
        initialFlex: 0.75,
        headerName: t('userTable.headerPhoneNumber'),
      },
      {
        id: 4,
        colId: 'state',
        field: 'state',
        hide: false,
        initialFlex: 0.5,
        headerName: t('userTable.headerIsActive'),
        cellRenderer: (params: ICellRendererParams<IUserEntity>) => (
          <UserStatusCell user={objectUtils.defaultObject(params?.data)} />
        ),
      },
      {
        id: 5,
        colId: 'createdAt',
        field: 'createdAt',
        hide: false,
        headerName: t('userTable.headerCreatedAt'),
        cellRenderer: (params: ICellRendererParams<IUserEntity>) => (
          <span>{formatDate(stringUtils.defaultString(params?.data?.createdAt))}</span>
        ),
      },
      {
        id: 6,
        colId: 'metadata',
        field: 'metadata',
        hide: false,
        headerName: t('userTable.headerActions'),
        initialFlex: 0.5,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<IUserEntity>) => (
          <UserActionsCell user={enumUtils.defaultEnum(params?.data)} />
        ),
      },
    ] as GridColDef<IUserEntity>[];

    cols.map((col) => {
      col.headerComponentParams = {
        openToolDialog,
        onToggleToolDialog,
      };
      if (["metadata"].includes(stringUtils.defaultString(col.colId))) {
        col.sortable = false;
      }
      return col;
    });

    return cols;
  }, [t, onToggleToolDialog, openToolDialog]);

  const [columns, setColumns] = useState(userColumns);

  const updateColumns = (cols: GridColDef<IUserEntity>[]) => {
    setColumns(cols);
  };

  return {
    columns,
    updateColumns,
  };
}

export { useUserManagementColumns };
