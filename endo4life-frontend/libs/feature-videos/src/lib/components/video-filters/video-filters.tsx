import { filterUtils, IFilter } from '@endo4life/types';
import {
  Button,
  FormInputSelect,
  FormInputText,
} from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { TbSearch } from 'react-icons/tb';
import { VideoFilter } from '../../types';
import { useVideoStateOptions } from '../../hooks';
import { BiFilterAlt } from 'react-icons/bi';
import { useToggle } from 'ahooks';
import { VideoFilterDialog } from '../video-filter-modal/video-filter-modal';

interface Props {
  filter: IFilter;
  onChange(filter: IFilter): void;
}
export function VideoFilters({ filter, onChange }: Props) {
  const { t } = useTranslation('video');
  const { options: videoStateOptions } = useVideoStateOptions();
  const [openFilterDialog, openFilterDialogAction] = useToggle(false);

  const handleSearchChange = (value: string) => {
    const videoFilter = new VideoFilter(filter);
    videoFilter.setSearch(value);
    videoFilter.setQuery('title', value?.trim() || undefined);
    videoFilter.setPage(0);
    onChange(videoFilter.toFilter());
  };

  const handleDisplayChange = (state: string) => {
    const videoFilter = new VideoFilter(filter);
    videoFilter.setQuery('state', state);
    onChange(videoFilter.toFilter());
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white border rounded-md border-slate-200">
        <div className="flex items-center gap-4">
          <FormInputText
            placeholder={t('videoFilter.inputSearchPlaceholder')}
            icon={<TbSearch />}
            defaultValue={filter.search}
            onSubmit={handleSearchChange}
          />
          <FormInputSelect
            className="col-span-2 min-w-48"
            placeholder={t('videoFilter.selectDisplayPlaceholder')}
            value={filterUtils.getString(filter, 'state')}
            onSubmit={handleDisplayChange}
            options={videoStateOptions}
          />
        </div>
        <Button
          text={t('leading.txtFilter')}
          variant="outline"
          textClassName="hidden lg:block"
          onClick={openFilterDialogAction.toggle}
        >
          <BiFilterAlt size={16} />
        </Button>
      </div>
      {openFilterDialog && (
        <VideoFilterDialog
          filter={filter}
          onChange={onChange}
          onClose={() => openFilterDialogAction.setLeft()}
        />
      )}
    </>
  );
}

export default VideoFilters;
