import { TagType } from '@endo4life/data-access';
import { Card, CardContent, Typography } from '@mui/material';
import { TbTags, TbCheck, TbStack2 } from 'react-icons/tb';

interface ITagStatsCardProps {
  selectedType: TagType;
  totalTags: number;
  selectedCount: number;
}

export default function TagStatsCard({
  selectedType,
  totalTags,
  selectedCount,
}: ITagStatsCardProps) {
  const getTypeLabel = (type: TagType): string => {
    switch (type) {
      case TagType.DamageTag:
        return 'Damage Tags';
      case TagType.AnatomyLocationTag:
        return 'Anatomy Locations';
      case TagType.HpTag:
        return 'HP Classifications';
      case TagType.LightTag:
        return 'Light Types';
      case TagType.UpperGastroAnatomyTag:
        return 'Upper GI Anatomies';
      default:
        return 'Tags';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      <Card>
        <CardContent>
          <Typography variant="subtitle2" className="text-gray-500 mb-2">
            Total Tags
          </Typography>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{totalTags}</div>
              <div className="text-sm text-gray-600 mt-1">
                {getTypeLabel(selectedType)}
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TbTags size={24} className="text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" className="text-gray-500 mb-2">
            Selected
          </Typography>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">{selectedCount}</div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedCount > 0 ? 'items selected' : 'No selection'}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TbCheck size={24} className="text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" className="text-gray-500 mb-2">
            Type Info
          </Typography>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {selectedType === TagType.DamageTag ? 'Hierarchical' : 'Flat'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedType === TagType.DamageTag 
                  ? 'Parent-Child structure' 
                  : 'Simple list structure'}
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TbStack2 size={24} className="text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

