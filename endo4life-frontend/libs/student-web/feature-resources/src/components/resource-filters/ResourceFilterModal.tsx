import { Modal } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ResourceFilterForm } from './ResourceFilterForm';
import {
  FilterBuilder,
  FilterQueryBuilder,
  filterUtils,
  IFilter,
} from '@endo4life/types';

import { useMemo } from 'react';
import { IResourceFilterFormData } from '../../types/resource-filter-formdata';

interface Props {
  filter: IFilter;
  onChange?(filter?: IFilter): void;
  onClose(): void;
}
export function ResourceFilterModal({ filter, onChange, onClose }: Props) {
  const { t } = useTranslation('image');

  const handleSubmit = (data: IResourceFilterFormData) => {
    const filterBuilder = new FilterBuilder(filter?.page, filter?.size);
    if (filter?.search) filterBuilder.setSearch(filter.search);

    if (data.tag) {
      filterBuilder.addQuery(new FilterQueryBuilder('tag', data.tag).build());
    }
    if (data.detailTag) {
      filterBuilder.addQuery(
        new FilterQueryBuilder('detailTag', data.detailTag).build()
      );
    }
    filterBuilder.addQuery(
      new FilterQueryBuilder('resourceType', data.resourceType).build()
    );
    onChange && onChange(filterBuilder.build());
    onClose();
  };

  const defaultFormData = useMemo<IResourceFilterFormData>(() => {
    return {
      resourceType: filterUtils.getString(filter, 'resourceType'),
      tag: filterUtils.getString(filter, 'tag'),
      detailTag: filterUtils.getString(filter, 'detailTag'),
    };
  }, [filter]);

  return (
    <Modal
      open
      onClose={onClose}
      className="flex items-start justify-center py-20"
    >
      <section className="w-full max-w-xl bg-white rounded shadow">
        <header className="flex items-center gap-4 p-6 pb-0">
          <h2 className="flex-auto font-semibold text-title">
            {t('filterForm.title')}
          </h2>
        </header>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <ResourceFilterForm
            data={defaultFormData}
            onClose={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </Modal>
  );
}
