import { Modal } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { IImageFilterFormData } from '../../types';
import { ImageFiltersForm } from './image-filter-form';
import {
  FilterBuilder,
  FilterQueryBuilder,
  filterUtils,
  IFilter,
} from '@endo4life/types';

import { useMemo } from 'react';

interface Props {
  filter: IFilter;
  onChange?(filter?: IFilter): void;
  onClose(): void;
}
export function ImageFilterDialog({ filter, onChange, onClose }: Props) {
  const { t } = useTranslation('image');

  const handleSubmit = (data: IImageFilterFormData) => {
    const filterBuilder = new FilterBuilder(filter?.page, filter?.size);
    if (filter?.search) filterBuilder.setSearch(filter.search);
    if (data.numComments && data.commentOperator) {
      filterBuilder.addQuery(
        new FilterQueryBuilder('commentOperator', data.commentOperator).build(),
      );
      filterBuilder.addQuery(
        new FilterQueryBuilder(
          'numComments',
          data.numComments.toString(),
        ).build(),
      );
    }
    if (data.numViews && data.viewOperator) {
      filterBuilder.addQuery(
        new FilterQueryBuilder('viewOperator', data.viewOperator).build(),
      );
      filterBuilder.addQuery(
        new FilterQueryBuilder('numViews', data.numViews.toString()).build(),
      );
    }

    if (data.fromDate) {
      filterBuilder.addQuery(
        new FilterQueryBuilder('fromDate', data.fromDate).build(),
      );
    }
    if (data.toDate) {
      filterBuilder.addQuery(
        new FilterQueryBuilder('toDate', data.toDate).build(),
      );
    }
    if (data.tag) {
      filterBuilder.addQuery(new FilterQueryBuilder('tag', data.tag).build());
    }
    if (data.detailTag) {
      filterBuilder.addQuery(
        new FilterQueryBuilder('detailTag', data.detailTag).build(),
      );
    }
    filterBuilder.addQuery(
      new FilterQueryBuilder('resourceType', data.resourceType).build(),
    );
    onChange && onChange(filterBuilder.build());
    onClose();
  };

  const defaultFormData = useMemo<IImageFilterFormData>(() => {
    return {
      resourceType: filterUtils.getString(filter, 'resourceType'),
      commentOperator: filterUtils.getString(filter, 'commentOperator'),
      viewOperator: filterUtils.getString(filter, 'viewOperator'),
      numComments: filterUtils.getNumber(filter, 'numComments'),
      numViews: filterUtils.getNumber(filter, 'numViews'),
      fromDate: filterUtils.getString(filter, 'fromDate'),
      toDate: filterUtils.getString(filter, 'toDate'),
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
            {t('imageFilterForm.title')}
          </h2>
        </header>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <ImageFiltersForm
            data={defaultFormData}
            onClose={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </Modal>
  );
}
