import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

interface TableLoadingProps {
  open?: boolean;
  text: string;
  colSpan: number;
}
export function TableLoading({ open, colSpan, text }: TableLoadingProps) {
  if (!open) return null;
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <div className="p-4 text-center">{text}</div>
      </TableCell>
    </TableRow>
  );
}

export default TableLoading;
