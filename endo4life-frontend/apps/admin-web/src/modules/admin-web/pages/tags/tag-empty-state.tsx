import { Box, Typography, Button } from '@mui/material';
import { TbTags } from 'react-icons/tb';
import { VscAdd } from 'react-icons/vsc';
import { TagType } from '@endo4life/data-access';

interface ITagEmptyStateProps {
  tagType: TagType;
  onCreateClick: () => void;
}

export default function TagEmptyState({ tagType, onCreateClick }: ITagEmptyStateProps) {
  const getTypeName = (): string => {
    switch (tagType) {
      case TagType.DamageTag:
        return 'Damage Tags';
      case TagType.AnatomyLocationTag:
        return 'Anatomy Location Tags';
      case TagType.HpTag:
        return 'HP Classification Tags';
      case TagType.LightTag:
        return 'Light Type Tags';
      case TagType.UpperGastroAnatomyTag:
        return 'Upper GI Anatomy Tags';
      default:
        return 'Tags';
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <TbTags size={48} className="text-gray-400" />
      </div>
      
      <Typography variant="h6" className="text-gray-700 font-semibold mb-2">
        No {getTypeName()} Found
      </Typography>
      
      <Typography variant="body2" className="text-gray-500 text-center mb-6 max-w-md">
        Get started by creating your first {getTypeName().toLowerCase()}. Tags help organize and categorize your medical images and resources.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={<VscAdd size={18} />}
        onClick={onCreateClick}
      >
        Create First Tag
      </Button>
    </Box>
  );
}

