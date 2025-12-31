import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, PageHeader, FormInputSelect } from '@endo4life/ui-common';
import { VscAdd, VscRefresh } from 'react-icons/vsc';
import { MdDelete } from 'react-icons/md';
import {
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useToggle } from 'ahooks';
import { TagType } from '@endo4life/data-access';
import {
  useAllTagsByType,
  ITagEntity,
  REACT_QUERY_KEYS,
} from '@endo4life/feature-tag';
import { useQueryClient } from 'react-query';
import TagCreateDialog from './tag-create-dialog';
import TagDeleteDialog from './tag-delete-dialog';
import TagTable from './tag-table';
import TagStatsCard from './tag-stats-card';
import TagEmptyState from './tag-empty-state';

export default function TagsPage() {
  const { t } = useTranslation(['common']);
  const client = useQueryClient();
  const [selectedType, setSelectedType] = useState<TagType>(TagType.DamageTag);
  const { data, loading } = useAllTagsByType(selectedType);
  const [isCreateDialogOpen, createDialogToggle] = useToggle(false);
  const [isDeleteDialogOpen, deleteDialogToggle] = useToggle(false);
  const [selectedTags, setSelectedTags] = useState<ITagEntity[]>([]);

  const tagTypeOptions = useMemo(
    () => [
      {
        label: 'Damage Tag (Parent-Child)',
        value: TagType.DamageTag,
        description: 'Lesion types with hierarchical details',
      },
      {
        label: 'Anatomy Location',
        value: TagType.AnatomyLocationTag,
        description: 'Anatomical locations (Rectum, Sigmoid, etc.)',
      },
      {
        label: 'HP Classification',
        value: TagType.HpTag,
        description: 'Helicobacter pylori status',
      },
      {
        label: 'Light Type',
        value: TagType.LightTag,
        description: 'Imaging light types (White Light, NBI, etc.)',
      },
      {
        label: 'Upper GI Anatomy',
        value: TagType.UpperGastroAnatomyTag,
        description: 'Upper gastrointestinal anatomy',
      },
    ],
    [],
  );

  const currentTagInfo = useMemo(() => {
    return tagTypeOptions.find((opt) => opt.value === selectedType);
  }, [selectedType, tagTypeOptions]);

  const handleRefresh = () => {
    client.invalidateQueries([REACT_QUERY_KEYS.TAGS]);
  };

  const openCreateDialog = () => createDialogToggle.setRight();
  const closeCreateDialog = () => createDialogToggle.setLeft();

  const openDeleteDialog = () => deleteDialogToggle.setRight();
  const closeDeleteDialog = () => deleteDialogToggle.setLeft();

  const handleDeleteSuccess = () => {
    setSelectedTags([]);
    closeDeleteDialog();
    handleRefresh();
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Quản lý nhãn"
        titleAction={
          <Tooltip title={t('common:txtRefresh')}>
            <span>
              <IconButton
                size="small"
                disabled={loading}
                onClick={handleRefresh}
              >
                <VscRefresh size={18} />
              </IconButton>
            </span>
          </Tooltip>
        }
        leading={
          <div className="flex items-center gap-4 lg:gap-8">
            <Button
              textClassName="hidden lg:block"
              text="Tạo nhãn"
              onClick={openCreateDialog}
            >
              <VscAdd size={16} />
            </Button>
            {selectedTags.length > 0 && (
              <Button
                textClassName="hidden lg:block"
                text={`Xoá (${selectedTags.length})`}
                variant="error"
                onClick={openDeleteDialog}
              >
                <MdDelete size={16} />
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-col flex-auto w-full h-1 px-5 py-4 overflow-y-auto bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" className="mb-3 font-semibold">
                  Loại nhãn
                </Typography>
                <FormInputSelect
                  label=""
                  value={selectedType}
                  options={tagTypeOptions.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                  onSubmit={(value) => setSelectedType(value as TagType)}
                  className="w-full"
                />
                {currentTagInfo && (
                  <p className="text-sm text-gray-600 mt-3">
                    {currentTagInfo.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <TagStatsCard
              selectedType={selectedType}
              totalTags={data.length}
              selectedCount={selectedTags.length}
            />
          </div>
        </div>

        {selectedType === TagType.DamageTag && (
          <Alert severity="info" className="mb-4">
            <AlertTitle>Cấu trúc Damage Tag</AlertTitle>
            Damage Tag hỗ trợ quan hệ cha-con. Tạo nhãn cha trước, sau đó thêm
            nhãn chi tiết làm con. Các loại nhãn khác là danh sách phẳng không
            có phân cấp.
          </Alert>
        )}

        {!loading && data.length === 0 ? (
          <TagEmptyState
            tagType={selectedType}
            onCreateClick={openCreateDialog}
          />
        ) : (
          <div
            className="bg-white rounded-lg shadow-sm p-4"
            style={{ height: '600px' }}
          >
            <TagTable
              data={data}
              loading={loading}
              selectedType={selectedType}
              onSelectionChanged={setSelectedTags}
            />
          </div>
        )}

        {isCreateDialogOpen && (
          <TagCreateDialog
            onClose={closeCreateDialog}
            selectedType={selectedType}
            onSuccess={handleRefresh}
          />
        )}

        {isDeleteDialogOpen && (
          <TagDeleteDialog
            tags={selectedTags}
            onClose={closeDeleteDialog}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
}
