import { Button } from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { AiOutlineClose } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi2';

interface Props {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

export function ImageDeleteMultipleDisplay({
  selectedCount,
  onDelete,
  onClearSelection,
  isLoading,
}: Props) {
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center justify-between p-4 bg-white">
      <div className="flex items-center gap-2">
        <AiOutlineClose
          size={18}
          className="cursor-pointer"
          onClick={onClearSelection}
        />
        <span>
          {t('txtSelected')}: {selectedCount}
        </span>
      </div>
      <Button
        text={t('txtDelete')}
        variant="outline"
        onClick={onDelete}
        disabled={isLoading}
      >
        <HiOutlineTrash size={16} />
      </Button>
    </div>
  );
}
