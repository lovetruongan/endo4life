import { ColDef } from 'ag-grid-community';
import { GridColDef } from '@endo4life/types';
import CustomHeader from '../components/custom-header/custom-header';
import { UniqueIdentifier } from '@dnd-kit/core';

function getTaskPosition<T>(items: GridColDef<T>[], id: UniqueIdentifier) {
  return items?.findIndex((task) => task.id === id);
}

function toColDef<T>(col: GridColDef<T>): ColDef<T> {
  return {
    field: col.field,
    colId: col.colId,
    headerName: col.headerName,
    headerClass: col.headerClass,
    initialFlex: col.initialFlex,
    sortable: col.sortable,
    hide: col.hide,
    resizable: col.resizable,
    cellRenderer: col.cellRenderer,
    headerComponent: col.headerComponentParams ? CustomHeader : null,
    headerComponentParams: col.headerComponentParams,
    pinned: col.pinned,
    width: col.width,
    minWidth: col.minWidth,
    maxWidth: col.maxWidth,
    filter: col.filter,
    suppressSizeToFit: col.suppressSizeToFit,
    suppressMovable: col.suppressMovable,
  };
}

function toColDefs<T>(cols: GridColDef<T>[]): ColDef<T>[] {
  return cols.map((col) => toColDef(col));
}

export { getTaskPosition, toColDef, toColDefs };
