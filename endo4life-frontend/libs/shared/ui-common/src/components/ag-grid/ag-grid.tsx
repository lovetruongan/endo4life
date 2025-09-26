import { RefObject, useMemo } from 'react';
import {
  ColDef,
  DomLayoutType,
  GridOptions,
  GridReadyEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import './ag-grid-theme.css';
import { AgGridReact } from 'ag-grid-react';
import { GridColDef } from '@endo4life/types';
import { useTranslation } from 'react-i18next';
import { toColDefs } from './utils';
import ToolDialog from './components/tool-dialog/tool-dialog';

export const defaultColDefAgGrid: ColDef = {
  autoHeight: true,
  autoHeaderHeight: true,
  resizable: true,
  sortable: true,
  initialFlex: 1,
  wrapHeaderText: true,
};

export const defaultRowSelection: RowSelectionOptions = {
  mode: 'multiRow',
  checkboxes: true,
};

export const defaultSelectionColumnDef: ColDef = {
  pinned: 'left',
  minWidth: 50,
  maxWidth: 50,
};

export const defaultDomLayout: DomLayoutType = 'autoHeight';

interface IAgGridProps<T> {
  gridRef?: RefObject<AgGridReact>;
  columns: GridColDef<T>[];
  rowData: T[] | undefined;
  loading: boolean;
  rowSelection?: RowSelectionOptions<T>;
  domLayout?: DomLayoutType;
  defaultColDef?: ColDef;
  selectionColumnDef?: ColDef<T>;
  overlayLoadingTemplate?: string;
  overlayNoRowsTemplate?: string;
  animateRows?: boolean;
  hasTableTool?: boolean;
  openToolDialog?: boolean;
  onToggleToolDialog?: () => void;
  onChangeColumns?: (col: GridColDef<T>[]) => void;
  onSortChanged?: (e: SortChangedEvent) => void;
  onGridReady?: (e: GridReadyEvent) => void;
  onSelectionChanged?: (e: SelectionChangedEvent) => void;
  colResizeDefault?: 'shift' | undefined;
}

function AgGrid<T>({
  gridRef,
  columns,
  rowData,
  loading,
  rowSelection,
  domLayout,
  defaultColDef,
  selectionColumnDef,
  animateRows,
  hasTableTool = true,
  openToolDialog = false,
  onToggleToolDialog,
  onChangeColumns,
  onSortChanged,
  onGridReady,
  onSelectionChanged,
  colResizeDefault = 'shift',
}: IAgGridProps<T>) {
  const { t } = useTranslation(['common']);

  const memoizedColumnDefs = useMemo(() => toColDefs(columns), [columns]);

  const handleToolClose = () => {
    onChangeColumns && onChangeColumns(columns);
    onToggleToolDialog && onToggleToolDialog();
  };

  const handleToolSubmit = (cols: GridColDef<T>[]) => {
    onChangeColumns && onChangeColumns(cols);
    onToggleToolDialog && onToggleToolDialog();
  };

  return (
    <div className="flex flex-col gap-3">
      <AgGridReact
        ref={gridRef}
        rowData={rowData ? rowData : []}
        columnDefs={memoizedColumnDefs}
        loading={loading}
        domLayout={domLayout || defaultDomLayout}
        rowSelection={rowSelection || defaultRowSelection}
        defaultColDef={defaultColDef || defaultColDefAgGrid}
        selectionColumnDef={selectionColumnDef || defaultSelectionColumnDef}
        overlayLoadingTemplate={t('common:txtLoading')}
        overlayNoRowsTemplate={t('common:txtNoResult')}
        animateRows={animateRows || true}
        rowBuffer={5}
        onSortChanged={onSortChanged}
        onGridReady={onGridReady}
        onSelectionChanged={onSelectionChanged}
        colResizeDefault={colResizeDefault}
      />
      {hasTableTool && openToolDialog && (
        <ToolDialog
          open={openToolDialog}
          columns={columns}
          onClose={handleToolClose}
          onSubmit={handleToolSubmit}
        />
      )}
    </div>
  );
}

export { AgGrid };
