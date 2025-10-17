import clsx from 'clsx';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ICourseInfoFormData,
  useCourseStateOptions,
} from '@endo4life/feature-course';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FormInputImage,
  FormInputSelect,
  FormInputText,
  FormSelectMulti,
} from '@endo4life/ui-common';
import { CourseState } from '@endo4life/data-access';
import {
  useSubTagOptions,
  useTagOptions,
} from '@endo4life/feature-tag';

interface Props {
  loading?: boolean;
  onSubmit(data: ICourseInfoFormData): void;
  data?: ICourseInfoFormData;
}

export function CourseDetailForm({ data, loading, onSubmit }: Props) {
  const { t } = useTranslation(['common', 'course']);
  const { options: stateOptions } = useCourseStateOptions();
  const schema = yup.object({
    course: yup.object({
      title: yup.string().required(
        t('common:txtRequiredField', {
          field_name: t('course:basicInfo.title'),
        }),
      ),
      lecturer: yup.string().required(
        t('common:txtRequiredField', {
          field_name: t('course:basicInfo.lecturer'),
        }),
      ),
      description: yup.string().required(
        t('common:txtRequiredField', {
          field_name: t('course:basicInfo.description'),
        }),
      ),
      state: yup
        .string()
        .default(CourseState.Unlisted)
        .required(
          t('common:txtRequiredField', {
            field_name: t('course:basicInfo.state'),
          }),
        ),
      tags: yup.string().optional(),
      tagsDetail: yup.string().optional(),
    }),
    thumbnail: yup.mixed(),
  });

  const { control, handleSubmit, formState, watch } =
    useForm<ICourseInfoFormData>({
      resolver: yupResolver(schema),
      defaultValues: data,
      mode: 'onChange',
    });

  const selectedTag = watch('course.tags');

  const { options: allTagOptions } = useTagOptions(selectedTag);
  const { options: subTagOptions } = useSubTagOptions(
    allTagOptions
      ?.filter((item) => selectedTag?.includes(item.label))
      .map((item) => item.metadata.id || '')
      .join(',') || '',
    '',
  );

  return (
    <form
      id="course-detail-form"
      onSubmit={handleSubmit(onSubmit)}
      className={clsx({
        'pointer-events-none cursor-default opacity-60': loading,
        'space-y-6': true,
      })}
    >
      <div className="p-6 w-full bg-white">
        <section className="grid gap-8 mb-6">
          <div id="info-basic" className="grid gap-4">
            <Controller
              name="course.title"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInputText
                  key={name}
                  label={t('course:basicInfo.title')}
                  value={value}
                  defaultValue={value}
                  isRequired
                  onChange={onChange}
                  errMessage={formState.errors.course?.title?.message}
                />
              )}
            />
            <Controller
              name="course.description"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputText
                    key={name}
                    label={t('course:basicInfo.description')}
                    isRequired
                    value={value}
                    defaultValue={value}
                    onSubmit={onChange}
                    errMessage={formState.errors.course?.description?.message}
                  />
                );
              }}
            />
            <Controller
              name="course.lecturer"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputText
                    key={name}
                    label={t('course:basicInfo.lecturer')}
                    isRequired
                    value={value}
                    defaultValue={value}
                    onChange={onChange}
                    errMessage={formState.errors.course?.lecturer?.message}
                  />
                );
              }}
            />
            <Controller
              name="course.state"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputSelect
                    className="flex-1 font-medium"
                    label={t('course:basicInfo.state')}
                    placeholder={t('course:basicInfo.state')}
                    isRequired
                    value={value}
                    options={stateOptions}
                    onSubmit={onChange}
                    errMessage={formState.errors.course?.state?.message}
                  />
                );
              }}
            />
            <Controller
              name="course.tags"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormSelectMulti
                  className="flex flex-col w-full text-xs"
                  options={allTagOptions}
                  key={name}
                  label={t('course:basicInfo.tag')}
                  value={value?.split(',')}
                  placeholder="Chọn nhãn"
                  onChange={(val) => onChange(val.join(','))}
                />
              )}
            />
            <Controller
              name="course.tagsDetail"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormSelectMulti
                  disabled={!selectedTag}
                  className="flex flex-col w-full text-xs"
                  options={subTagOptions}
                  key={name}
                  label={t('course:basicInfo.detailTag')}
                  value={value?.split(',')}
                  placeholder="Chọn nhãn chi tiết"
                  onChange={(val) => onChange(val.join(','))}
                />
              )}
            />
            <Controller
              name="thumbnail"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInputImage
                  key={name}
                  label={t('course:basicInfo.thumbnail')}
                  value={value}
                  resourceUrl={
                    data?.thumbnailUrl
                      ? `https://endo-minio-api.aiscaler.net/thumbnails/${data?.thumbnailUrl}`
                      : undefined
                  }
                  onChange={onChange}
                  errMessage={formState.errors.thumbnail?.message}
                  className="w-2/5 h-80"
                />
              )}
            />
          </div>
        </section>
      </div>
      <button type="submit" className="w-0 h-0 opacity-0" />
    </form>
  );
}

export default CourseDetailForm;
