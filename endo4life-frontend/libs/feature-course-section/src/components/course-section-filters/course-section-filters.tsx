import { filterUtils, IFilter } from '@endo4life/types';
import {
  FormInputSelect,
  FormInputText,
} from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { TbSearch } from 'react-icons/tb';
import { CourseSectionFilter } from '../../types';
import { useCourseStateOptions } from '../../hooks';

interface Props {
  filter: IFilter;
  onChange(filter: IFilter): void;
}
export function CourseSectionFilters({ filter, onChange }: Props) {
  const { t } = useTranslation('course');
  const { options: courseStateOptions } = useCourseStateOptions();

  const handleSearchChange = (title: string) => {
    const courseSectionFilter = new CourseSectionFilter(filter);
    courseSectionFilter.setQuery('title', title);
    onChange(courseSectionFilter.toFilter());
  };

  const handleDisplayChange = (state: string) => {
    const courseSectionFilter = new CourseSectionFilter(filter);
    courseSectionFilter.setQuery('state', state);
    onChange(courseSectionFilter.toFilter());
  };

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 bg-white border rounded-md border-slate-200">
        <div className="flex items-center gap-4">
          <FormInputText
            placeholder={t('courseFilter.inputSearchPlaceholder')}
            icon={<TbSearch />}
            value={filterUtils.getString(filter, 'title')}
            onSubmit={handleSearchChange}
          />
          <FormInputSelect
            className="col-span-2 min-w-48"
            placeholder={t('courseFilter.selectStatePlaceholder')}
            value={filterUtils.getString(filter, 'state')}
            onSubmit={handleDisplayChange}
            options={courseStateOptions}
          />
        </div>
      </div>
    </>
  );
}

export default CourseSectionFilters;
