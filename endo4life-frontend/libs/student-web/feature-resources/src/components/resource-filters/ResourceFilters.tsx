import {
  filterUtils,
  IFilter,
  SortOrderEnum,
} from '@endo4life/types';
import { Button, FormInputSelect } from '@endo4life/ui-common';
import { useToggle } from 'ahooks';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { VscFilter } from 'react-icons/vsc';
import { useResourceFilters } from '../../hooks';
import { ResourceFilter, ResourceTypeEnum } from '../../types';
import { ResourceFilterModal } from './ResourceFilterModal';
import styles from './ResourceFilters.module.css';
interface Props {
  onChange(filter: IFilter): void;
}
export function ResourceFilters({ onChange }: Props) {
  const { t } = useTranslation('common');
  const { filter, updateFilter } = useResourceFilters();
  const filterOptions = useMemo(
    () => [
      { label: t('filter.txtNewest'), value: 'createdAt' },
      { label: t('filter.txtMostPopular'), value: 'viewNumber' },
    ],
    [t],
  );

  const resourceType = useMemo<string>(()=>{
    return new ResourceFilter(filter).getType() || ResourceTypeEnum.IMAGE
  },[filter]);

  const [openFilterDialog, openFilterDialogAction] = useToggle(false);

  const handleOrderByChange = (orderBy: string) => {
    const newFilter = new ResourceFilter(filter);
    newFilter.setSort(orderBy, SortOrderEnum.DESC);
    updateFilter(newFilter.toFilter());
  };

  const getTextResourceType = () => {
    if (resourceType === ResourceTypeEnum.IMAGE) return t('navigation.txtMenuItemImage');
    if (resourceType === ResourceTypeEnum.VIDEO) return t('navigation.txtMenuItemVideo');
    if (resourceType === ResourceTypeEnum.COURSE) return t('navigation.txtMenuItemCourse');
    return resourceType;
  };

  return (
    <div
      className={clsx(styles['container'], {
        'mb-6': true,
      })}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{getTextResourceType()}</h2>
        <div className="flex items-center justify-end gap-3">
          <FormInputSelect
            clearable={false}
            className="flex-none w-44"
            options={filterOptions}
            value={filterUtils.getSort(filter)?.field}
            onChange={handleOrderByChange}
          />
          <Button
            text={t('image:leading.txtFilter')}
            variant="outline"
            textClassName="hidden lg:block font-normal text-gray-700"
            onClick={openFilterDialogAction.toggle}
            className="border !border-slate-300"
          >
            <VscFilter size={16} />
          </Button>
        </div>
      </div>

      {openFilterDialog && (
        <ResourceFilterModal
          filter={filter}
          onChange={onChange}
          onClose={() => openFilterDialogAction.setLeft()}
        />
      )}
    </div>
  );
}

export default ResourceFilters;
