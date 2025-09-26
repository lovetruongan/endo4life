import { FilterBuilder, FilterQueryBuilder, IFilter } from '@endo4life/types';
import clsx from 'clsx';
import { useMemo } from 'react';
import { ResourceTypeEnum, ResourceFilter } from '../../types';
import { useTranslation } from 'react-i18next';
interface Props {
  filter: IFilter;
  onChange(filter: IFilter): void;
}
export function ResourceTypeSelect({filter, onChange}: Props) {
  const { t } = useTranslation(['common']);
  const type = useMemo<string>(()=>{
    return new ResourceFilter(filter).getType() || ResourceTypeEnum.IMAGE
  },[filter]);

  const onClickType = (type: string) =>{
    const filterBuilder = new FilterBuilder(0, filter?.size);
    filterBuilder.addQuery(new FilterQueryBuilder('resourceType', type).build());
    onChange && onChange(filterBuilder.build());
  }

  return (
    <div className="flex justify-center items-center my-6">
      <div className="bg-white p-0 h-[48px] flex justify-between gap-1">
        <button className={clsx("px-4 py-2 rounded-full font-medium", {'bg-[#403B70] text-white' : type === 'IMAGE',})} onClick={() => onClickType(ResourceTypeEnum.IMAGE)}>
          {t('common:navigation.txtMenuItemImage')}
        </button>
        <button className={clsx("px-4 py-2 rounded-full font-medium", {'bg-[#403B70] text-white' : type === 'VIDEO',})} onClick={() => onClickType(ResourceTypeEnum.VIDEO)}>
          {t('common:navigation.txtMenuItemVideo')}
        </button>
        <button className={clsx("px-4 py-2 rounded-full font-medium", {'bg-[#403B70] text-white' : type === 'COURSE',})} onClick={() => onClickType(ResourceTypeEnum.COURSE)}>
        {t('common:navigation.txtMenuItemCourse')}
        </button>
      </div>
    </div>
  );
}

export default ResourceTypeSelect;
