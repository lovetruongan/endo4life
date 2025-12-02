import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { IBookEntity } from '../types';
import { IoWarningOutline } from 'react-icons/io5';

interface Props {
  open: boolean;
  book: IBookEntity | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function BookDeleteDialog({
  open,
  book,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="flex items-center gap-2">
        <IoWarningOutline className="text-red-500" size={24} />
        <span>Delete Document</span>
      </DialogTitle>

      <DialogContent>
        <p className="text-gray-600">
          Are you sure you want to delete{' '}
          <strong className="text-gray-900">{book?.title}</strong>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone.
        </p>
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={onClose} disabled={isLoading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={16} />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookDeleteDialog;

