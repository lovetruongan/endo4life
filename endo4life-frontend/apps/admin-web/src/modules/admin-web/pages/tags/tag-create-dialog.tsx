import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Box,
  CircularProgress,
  Divider,
  Typography,
  Alert,
} from '@mui/material';
import { TagType } from '@endo4life/data-access';
import { useCreateTag } from '@endo4life/feature-tag';
import { toast } from 'react-toastify';
import { TbTags, TbSubtask } from 'react-icons/tb';

interface ITagCreateDialogProps {
  onClose: () => void;
  selectedType: TagType;
  onSuccess: () => void;
}

export default function TagCreateDialog({
  onClose,
  selectedType,
  onSuccess,
}: ITagCreateDialogProps) {
  const { t } = useTranslation(['common']);
  const { mutation } = useCreateTag();
  const [tagType, setTagType] = useState<TagType>(selectedType);
  const [parentTags, setParentTags] = useState<string[]>([]);
  const [detailTags, setDetailTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [currentDetailTag, setCurrentDetailTag] = useState('');

  const tagTypeOptions = useMemo(
    () => [
      { label: 'Damage Tag', value: TagType.DamageTag },
      { label: 'Anatomy Location', value: TagType.AnatomyLocationTag },
      { label: 'HP Tag', value: TagType.HpTag },
      { label: 'Light Tag', value: TagType.LightTag },
      { label: 'Upper GI Anatomy', value: TagType.UpperGastroAnatomyTag },
    ],
    [],
  );

  const handleAddTag = () => {
    if (currentTag.trim()) {
      setParentTags([...parentTags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleAddDetailTag = () => {
    if (currentDetailTag.trim()) {
      setDetailTags([...detailTags, currentDetailTag.trim()]);
      setCurrentDetailTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setParentTags(parentTags.filter((_, i) => i !== index));
  };

  const handleRemoveDetailTag = (index: number) => {
    setDetailTags(detailTags.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (parentTags.length === 0) {
      toast.error('At least one tag is required');
      return;
    }

    if (parentTags.length > 1 && detailTags.length > 0) {
      toast.error('Only one parent tag allowed when creating detail tags');
      return;
    }

    try {
      await mutation.mutateAsync({
        tag: parentTags,
        detailTag: detailTags,
        type: tagType,
      });
      toast.success('Tag created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create tag');
    }
  };

  const getTypeColor = (type: TagType): 'primary' | 'success' | 'warning' | 'info' | 'error' => {
    switch (type) {
      case TagType.DamageTag: return 'error';
      case TagType.AnatomyLocationTag: return 'primary';
      case TagType.HpTag: return 'warning';
      case TagType.LightTag: return 'info';
      case TagType.UpperGastroAnatomyTag: return 'success';
      default: return 'primary';
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="pb-2">
        <div className="flex items-center gap-2">
          <TbTags size={24} />
          <span>Create New Tags</span>
        </div>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent className="pt-4">
        <Box className="flex flex-col gap-5">
          {/* Tag Type Selector */}
          <Box>
            <TextField
              select
              label="Tag Type"
              value={tagType}
              onChange={(e) => setTagType(e.target.value as TagType)}
              fullWidth
              variant="outlined"
            >
              {tagTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Parent Tags Section */}
          <Box className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TbTags size={18} className="text-gray-600" />
              <Typography variant="subtitle2" className="font-semibold text-gray-700">
                Parent Tags
              </Typography>
            </div>
            
            <TextField
              label="Add Parent Tag"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              fullWidth
              size="small"
              placeholder="Type tag name and press Enter"
              helperText="Press Enter to add tag to the list below"
            />
            
            {parentTags.length > 0 && (
              <Box className="flex flex-wrap gap-2 mt-3 p-3 bg-white rounded border border-gray-200">
                {parentTags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(index)}
                    color={getTypeColor(tagType)}
                    variant="filled"
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Detail Tags Section (Only for Damage Tags) */}
          {tagType === TagType.DamageTag && (
            <>
              <Divider />
              <Box className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TbSubtask size={18} className="text-blue-600" />
                  <Typography variant="subtitle2" className="font-semibold text-blue-700">
                    Detail Tags (Optional)
                  </Typography>
                </div>
                
                {parentTags.length > 1 && (
                  <Alert severity="warning" className="mb-3">
                    Detail tags can only be added with a single parent tag. Please add only one parent tag to enable this feature.
                  </Alert>
                )}
                
                <TextField
                  label="Add Detail Tag"
                  value={currentDetailTag}
                  onChange={(e) => setCurrentDetailTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDetailTag();
                    }
                  }}
                  fullWidth
                  size="small"
                  placeholder="Type detail tag name and press Enter"
                  helperText="Detail tags are children of the parent tag"
                  disabled={parentTags.length !== 1}
                />
                
                {detailTags.length > 0 && (
                  <Box className="flex flex-wrap gap-2 mt-3 p-3 bg-white rounded border border-blue-200">
                    {detailTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveDetailTag(index)}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Summary */}
          {parentTags.length > 0 && (
            <Alert severity="info" icon={false}>
              <Typography variant="body2">
                <strong>Summary:</strong> Creating {parentTags.length} parent tag{parentTags.length > 1 ? 's' : ''}
                {detailTags.length > 0 && ` with ${detailTags.length} detail tag${detailTags.length > 1 ? 's' : ''}`}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions className="px-6 py-4">
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={parentTags.length === 0 || mutation.isLoading}
          startIcon={mutation.isLoading ? <CircularProgress size={16} color="inherit" /> : <TbTags size={18} />}
        >
          {mutation.isLoading ? 'Creating...' : 'Create Tags'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
