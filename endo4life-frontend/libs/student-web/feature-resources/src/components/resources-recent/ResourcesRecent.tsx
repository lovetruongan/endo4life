import { IFilter } from '@endo4life/types';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceFilter, ResourceTypeEnum } from '../../types';
import styles from './ResourcesRecent.module.css';

interface Props {
  filter: IFilter;
}

export function ResourcesRecent({ filter }: Props) {
  const { t } = useTranslation('common');
  const resourceType = useMemo<string>(() => {
    return new ResourceFilter(filter).getType() || ResourceTypeEnum.IMAGE;
  }, [filter]);

  const getTextResourceType = useMemo(() => {
    if (resourceType === ResourceTypeEnum.IMAGE) return t('navigation.txtMenuItemImage');
    if (resourceType === ResourceTypeEnum.VIDEO) return t('navigation.txtMenuItemVideo');
    if (resourceType === ResourceTypeEnum.COURSE) return t('navigation.txtMenuItemCourse');
    return resourceType;
  }, [t, resourceType]);

  return (
    <div
      className={clsx(styles['container'], {
        'mt-6': true,
      })}
    >
      <h2 className="text-lg font-semibold">
        {getTextResourceType}&nbsp;
        {t('txtViewRecent')}
      </h2>

    </div>
  );
}

export default ResourcesRecent;
