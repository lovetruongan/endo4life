import {
  useSubTagOptions,
  useTagOptions,
} from '@endo4life/feature-tag';
import {
  Button,
  FormSelectMulti
} from '@endo4life/ui-common';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { IResourceFilterFormData } from '../../types/resource-filter-formdata';
interface Props {
  data?: IResourceFilterFormData;
  onSubmit(filterForm: IResourceFilterFormData): void;
  onClose?(): void;
}

export const ResourceFilterForm = ({ data, onClose, onSubmit }: Props) => {
  const { t } = useTranslation('image');

  const schema = yup.object({
    tag: yup.string().optional(),
    detailTag: yup.string().optional(),
  });

  const { control, handleSubmit, watch } = useForm<IResourceFilterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      ...(data || {})
    },
  });

  const selectedTag = watch('tag');

  const { options: allTagOptions } = useTagOptions(selectedTag);
  const { options: subTagOptions } = useSubTagOptions(
    allTagOptions
      ?.filter((item) => selectedTag?.includes(item.label))
      .map((item) => item.metadata.id || '')
      .join(',') || '',
    ''
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-6')}>
      <div className="grid items-end grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <Controller
          name="tag"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormSelectMulti
              className="col-span-2"
              label={t('image:imageTable.tags')}
              value={value?.split(',')}
              placeholder="Chọn nhãn"
              options={allTagOptions}
              onChange={(val) => onChange(val.join(','))}
            />
          )}
        />

        <Controller
          name="detailTag"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormSelectMulti
              disabled={!selectedTag}
              className="col-span-2"
              label={t('image:imageTable.detail_tags')}
              value={value?.split(',')}
              placeholder="Chọn nhãn chi tiết"
              options={subTagOptions}
              onChange={(val) => onChange(val.join(','))}
            />
          )}
        />
      </div>
      
      <div className="flex items-center justify-between gap-2 pt-4">
        <Button
          text="Xoá bộ lọc"
          type="button"
          onClick={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            onSubmit({
              ...data,
              tag: undefined,
              detailTag: undefined,
            });
          }}
          className="h-12 py-2 text-sm font-bold px-9 border-1"
          variant="outline"
        />
        <div className="flex items-center justify-center gap-2">
          <Button
            text="Huỷ"
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              onClose && onClose();
            }}
            className="h-12 py-2 text-sm font-bold px-9 border-1"
            variant="outline"
          />
          <Button
            text="Áp dụng"
            type="submit"
            variant="fill"
            className="h-12 py-4 text-sm font-bold px-9"
          />
        </div>
      </div>
    </form>
  );
};
