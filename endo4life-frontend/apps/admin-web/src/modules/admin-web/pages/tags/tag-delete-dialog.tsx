import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  Box,
} from '@mui/material';
import { ITagEntity, useDeleteTag } from '@endo4life/feature-tag';
import { toast } from 'react-toastify';
import { MdDelete, MdWarning } from 'react-icons/md';

interface ITagDeleteDialogProps {
  tags: ITagEntity[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function TagDeleteDialog({
  tags,
  onClose,
  onSuccess,
}: ITagDeleteDialogProps) {
  const { t } = useTranslation(['common']);
  const { mutation } = useDeleteTag();

  const handleDelete = async () => {
    const parentTagIds = tags
      .filter((tag) => !tag.metadata?.parentId)
      .map((tag) => tag.id);
    const detailTagIds = tags
      .filter((tag) => tag.metadata?.parentId)
      .map((tag) => tag.id);

    try {
      await mutation.mutateAsync({
        tagIds: parentTagIds.length > 0 ? parentTagIds : undefined,
        tagDetailIds: detailTagIds.length > 0 ? detailTagIds : undefined,
      });
      toast.success(
        `${tags.length} tag${tags.length > 1 ? 's' : ''} deleted successfully`,
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete tags');
    }
  };

  const hasParentTags = tags.some((tag) => !tag.metadata?.parentId);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="pb-2">
        <div className="flex items-center gap-2 text-red-600">
          <MdWarning size={24} />
          <span>Confirm Deletion</span>
        </div>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent className="pt-4">
        <Alert severity="error" className="mb-4">
          <AlertTitle>Warning: This action cannot be undone!</AlertTitle>
          You are about to delete {tags.length} tag{tags.length > 1 ? 's' : ''}.
          {hasParentTags && ' Deleting parent tags will also delete all their children.'}
        </Alert>

        <Box className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            Tags to be deleted:
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.content}
                color="error"
                variant="outlined"
                size="small"
                onDelete={() => {}} // Show delete icon but disabled
                deleteIcon={<MdDelete size={16} />}
              />
            ))}
          </div>
        </Box>

        {hasParentTags && (
          <Alert severity="warning" className="mt-3">
            <AlertTitle>Cascade Delete</AlertTitle>
            Parent tags in this selection will delete all associated child tags automatically.
          </Alert>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={mutation.isLoading}
          startIcon={
            mutation.isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <MdDelete size={18} />
            )
          }
        >
          {mutation.isLoading ? 'Deleting...' : `Delete ${tags.length} Tag${tags.length > 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
