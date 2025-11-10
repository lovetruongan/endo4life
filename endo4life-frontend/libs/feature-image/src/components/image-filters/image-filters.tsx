import { filterUtils, IFilter } from '@endo4life/types';
import {
  Button,
  FormInputSelect,
  FormInputText,
} from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { TbSearch } from 'react-icons/tb';
import { ImageFilter } from '../../types';
import { useImageStateOptions } from '../../hooks';
import { BiFilterAlt } from 'react-icons/bi';
import { useToggle } from 'ahooks';
import { ImageFilterDialog } from '../image-filter-modal/image-filter-modal';

interface Props {
  filter: IFilter;
  onChange(filter: IFilter): void;
}
export function ImageFilters({ filter, onChange }: Props) {
  const { t } = useTranslation('image');
  const { options: imageStateOptions } = useImageStateOptions();
  const [openFilterDialog, openFilterDialogAction] = useToggle(false);

  const handleSearchChange = (value: string) => {
    const imageFilter = new ImageFilter(filter);
    // Persist generic search text for URL/state
    imageFilter.setSearch(value);
    // Also filter explicitly by title to ensure backend matches by name
    imageFilter.setQuery('title', value?.trim() || undefined);
    imageFilter.setPage(0);
    onChange(imageFilter.toFilter());
  };

  const handleDisplayChange = (state: string) => {
    const imageFilter = new ImageFilter(filter);
    imageFilter.setQuery('state', state);
    onChange(imageFilter.toFilter());
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white border rounded-md border-slate-200">
        <div className="flex items-center gap-4">
          <FormInputText
            placeholder={t('imageFilter.inputSearchPlaceholder')}
            icon={<TbSearch />}
            defaultValue={filter.search}
            onSubmit={handleSearchChange}
          />
          <FormInputSelect
            className="col-span-2 min-w-48"
            placeholder={t('imageFilter.selectDisplayPlaceholder')}
            value={filterUtils.getString(filter, 'state')}
            onSubmit={handleDisplayChange}
            options={imageStateOptions}
          />
        </div>
        <Button
          text={t('image:leading.txtFilter')}
          variant="outline"
          textClassName="hidden lg:block"
          onClick={openFilterDialogAction.toggle}
        >
          <BiFilterAlt size={16} />
        </Button>
      </div>
      {openFilterDialog && (
        <ImageFilterDialog
          filter={filter}
          onChange={onChange}
          onClose={() => openFilterDialogAction.setLeft()}
        />
      )}
    </>
  );
}

export default ImageFilters;
