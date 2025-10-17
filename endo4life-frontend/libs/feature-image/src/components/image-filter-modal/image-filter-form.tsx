import {
  Button,
  FormInputSelect,
  FormSelectMulti,
  FormInputDate,
  FormInputNumber,
} from '@endo4life/ui-common';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { IImageFilterFormData } from '../../types';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  useSubTagOptions,
  useTagOptions,
} from '@endo4life/feature-tag';
import { useFilterOperatorOptions } from '../../hooks';
interface Props {
  data?: IImageFilterFormData;
  onSubmit(filterForm: IImageFilterFormData): void;
  onClose?(): void;
}

export const ImageFiltersForm = ({ data, onClose, onSubmit }: Props) => {
  const { t } = useTranslation('image');

  const schema = yup.object({
    commentOperator: yup.string().optional(),
    viewOperator: yup.string().optional(),
    numComments: yup.number().optional(),
    numViews: yup.number().optional(),
    fromDate: yup.string().optional(),
    toDate: yup.string().optional(),
    tag: yup.string().optional(),
    detailTag: yup.string().optional(),
  });

  const { control, handleSubmit, watch } = useForm<IImageFilterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      ...(data || {}),
      commentOperator: data?.commentOperator || '<=',
      viewOperator: data?.viewOperator || '<=',
      numComments:
        data?.numComments && data.numComments > 0
          ? data.numComments
          : undefined,
      numViews: data?.numViews && data.numViews > 0 ? data.numViews : undefined,
    },
  });

  const selectedTag = watch('tag');

  const { options: allTagOptions } = useTagOptions(selectedTag);
  const { options: subTagOptions } = useSubTagOptions(
    allTagOptions
      ?.filter((item) => selectedTag?.includes(item.label))
      .map((item) => item.metadata.id || '')
      .join(',') || '',
    '',
  );
  const { options: operatorOptions } = useFilterOperatorOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-6')}>
      <div className="grid items-end grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <Controller
          name="tag"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormSelectMulti
              className="col-span-2"
              label={t('image:basicInfo.tag')}
              value={value?.split(',')}
              placeholder={t('image:imageFilterForm.placeholders.tag')}
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
              label={t('image:basicInfo.detailTag')}
              value={value?.split(',')}
              placeholder={t('image:imageFilterForm.placeholders.detailTag')}
              options={subTagOptions}
              onChange={(val) => onChange(val.join(','))}
            />
          )}
        />

        <div className="flex items-end col-span-2 gap-2 md:col-span-1">
          <Controller
            name="commentOperator"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormInputSelect
                className="flex-none"
                label={t('image:basicInfo.commentCount')}
                value={value}
                onChange={onChange}
                options={operatorOptions}
              />
            )}
          />

          <Controller
            name="numComments"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormInputNumber
                className="flex-auto"
                value={value}
                onChange={(val) => {
                  if (val !== undefined && val < 0) {
                    onChange(0);
                  } else onChange(val);
                }}
              />
            )}
          />
        </div>
        <div className="flex items-end col-span-2 gap-2 md:col-span-1">
          <Controller
            name="viewOperator"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormInputSelect
                className="flex-none"
                label={t('image:basicInfo.viewNumber')}
                value={value}
                onChange={onChange}
                options={operatorOptions}
              />
            )}
          />

          <Controller
            name="numViews"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormInputNumber
                className="flex-auto"
                value={value}
                onChange={(val) => {
                  if (val !== undefined && val < 0) {
                    onChange(0);
                  } else onChange(val);
                }}
              />
            )}
          />
        </div>

        <Controller
          name="fromDate"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormInputDate
              className="w-full col-span-2 md:col-span-1"
              label={t('image:imageFilterForm.fromDate')}
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Controller
          name="toDate"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormInputDate
              className="w-full col-span-2 md:col-span-1"
              label={t('image:imageFilterForm.toDate')}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </div>
      <div className="flex items-center justify-between gap-2 pt-4">
        <Button
          text={t('image:imageFilterForm.resetFilter')}
          type="button"
          onClick={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            onSubmit({
              ...data,
              commentOperator: '<=',
              numComments: undefined,
              viewOperator: '<=',
              numViews: undefined,
              fromDate: undefined,
              toDate: undefined,
              tag: undefined,
              detailTag: undefined,
            });
          }}
          className="h-12 py-2 text-sm font-bold px-9 border-1"
          variant="outline"
        />
        <div className="flex items-center justify-center gap-2">
          <Button
            text={t('common:txtCancel')}
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              onClose && onClose();
            }}
            className="h-12 py-2 text-sm font-bold px-9 border-1"
            variant="outline"
          />
          <Button
            text={t('common:txtApply')}
            type="submit"
            variant="fill"
            className="h-12 py-4 text-sm font-bold px-9"
          />
        </div>
      </div>
    </form>
  );
};
