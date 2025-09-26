import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  courseScheme,
  ICourseFormData,
  useCourseStateOptions,
} from '@endo4life/feature-course';
import {
  Button,
  FormInputImage,
  FormInputRichText,
  FormInputSelect,
  FormInputText,
  FormSelectMulti,
} from '@endo4life/ui-common';
import {
  useSubTagOptions,
  useTagOptions,
} from '@endo4life/feature-tag';
import { localUuid } from '@endo4life/util-common';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IOption } from '@endo4life/types';

interface Props {
  loading?: boolean;
  data?: ICourseFormData;
  onClose(): void;
  onSubmit(data: ICourseFormData): void;
  txtSubmit?: string;
}

export function CourseForm({
  loading,
  data,
  onClose,
  onSubmit,
  txtSubmit = 'Tạo mới',
}: Props) {
  console.log(data);
  const { t } = useTranslation(['common', 'course']);
  const { options: stateOptions } = useCourseStateOptions();
  const fileImageInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, formState, watch } = useForm<ICourseFormData>({
    resolver: yupResolver(courseScheme),
    mode: 'onChange',
    defaultValues: data,
  });

  const selectedTag = watch('tags');

  const { options: allTagOptions } = useTagOptions();
  const { options: subTagOptions } = useSubTagOptions(
    getParentTags(allTagOptions, selectedTag),
  );

  return (
    <form
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
              name="title"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputText
                    key={name}
                    label={t('course:basicInfo.title')}
                    isRequired
                    value={value}
                    defaultValue={value}
                    onChange={onChange}
                    errMessage={formState.errors.title?.message}
                  />
                );
              }}
            />

            <Controller
              name="description"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInputRichText
                  key={name}
                  label={t('course:basicInfo.description')}
                  value={value?.content}
                  onChange={(val) => onChange({ content: val || '' })}
                  errMessage={formState.errors.description?.message}
                />
              )}
            />

            <Controller
              name="author"
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
                    errMessage={formState.errors.author?.message}
                  />
                );
              }}
            />

            <Controller
              name="state"
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
                    errMessage={formState.errors.state?.message}
                  />
                );
              }}
            />

            <Controller
              name="tags"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormSelectMulti
                  className="flex flex-col w-full text-xs"
                  options={allTagOptions}
                  key={name}
                  label="Gán nhãn tổn thương"
                  value={value}
                  placeholder="Chọn nhãn"
                  onChange={onChange}
                />
              )}
            />

            <Controller
              name="detailTags"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormSelectMulti
                  className="flex flex-col w-full text-xs"
                  options={subTagOptions}
                  key={name}
                  label="Gán nhãn tổn thương chi tiết"
                  value={value}
                  placeholder="Chọn nhãn"
                  onChange={onChange}
                />
              )}
            />
            <Controller
              name="thumbnail"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInputImage
                  className="min-h-60"
                  key={name}
                  label={t('course:courseSectionTable.thumbnail')}
                  value={value?.file}
                  resourceUrl={value?.src}
                  onChange={(file) =>
                    onChange({
                      id: localUuid(),
                      src: URL.createObjectURL(file),
                      fileName: file.name,
                      fileSize: file.size,
                      extension: file.type,
                      file: file,
                    })
                  }
                  fileInputRef={fileImageInputRef}
                  errMessage={formState.errors.thumbnail?.message}
                />
              )}
            />
          </div>
        </section>
        <div className="flex items-center justify-end p-4 gap-4">
          <Button
            variant="outline"
            text="Huỷ"
            className="text-sm px-8"
            onClick={onClose}
          />
          <Button
            disabled={loading}
            requesting={loading}
            type="submit"
            text={txtSubmit}
            className="text-sm px-8"
          />
        </div>
      </div>
    </form>
  );
}

function getParentTags(allTags: IOption[], selectedTabs: string[] = []) {
  const selectedItems = selectedTabs.join(', ');
  return allTags
    .filter((item) => selectedItems.includes(item.label))
    .map((item) => item.metadata?.id || '')
    .join(',');
}

export default CourseForm;
