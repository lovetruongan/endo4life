import { ColDef } from "ag-grid-community";

interface GridColDef<T> extends ColDef<T> {
  id?: number;
  disabled?: boolean;
}
interface ICustomHeaderComponentParamsProps {
  openToolDialog?: boolean;
  onToggleToolDialog?: () => void;
}

export {
  GridColDef,
  ICustomHeaderComponentParamsProps
}