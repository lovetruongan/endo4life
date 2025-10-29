import {
  FormSelectMulti,
  FormInputNumber,
  FormInputText,
  FormInputImage,
  FormInputVideo,
  FormInputRichText,
  Button,
} from '@endo4life/ui-common';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSubTagOptions, useTagOptions } from '@endo4life/feature-tag';
import { useRef } from 'react';
import { IOption } from '@endo4life/types';
import { courseLectureScheme, ICourseSectionFormData } from '../../types';
import { localUuid } from '@endo4life/util-common';

interface Props {
  id?: string;
  loading?: boolean;
  data?: ICourseSectionFormData;
  onSubmit(data: ICourseSectionFormData): void;
  onClose?(): void;
  txtSubmit?: string;
}

export function CourseSectionForm({
  id,
  data,
  loading,
  onSubmit,
  onClose,
  txtSubmit = 'Lưu',
}: Props) {
  console.log('data', data);
  const { t } = useTranslation(['common', 'course']);
  const fileImageInputRef = useRef<HTMLInputElement>(null);
  const fileVideoInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, formState, watch } =
    useForm<ICourseSectionFormData>({
      resolver: yupResolver(courseLectureScheme),
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
      id={id || 'course-section-form'}
      onSubmit={handleSubmit(onSubmit)}
      className={clsx({
        'pointer-events-none cursor-default opacity-60': loading,
      })}
    >
      <section
        className="grid grid-cols-1 gap-4 p-6 overflow-y-auto"
        style={{ maxHeight: '70vh' }}
      >
        <Controller
          name="title"
          control={control}
          render={({ field: { onChange, value, name } }) => {
            return (
              <FormInputText
                key={name}
                label="Tên bài giảng"
                value={value}
                defaultValue={value}
                isRequired
                onChange={onChange}
                errMessage={formState.errors.title?.message}
              />
            );
          }}
        />

        <Controller
          name="content"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormInputRichText
              key={name}
              label="Nội dung chính"
              value={value?.content}
              onChange={(val) => onChange({ content: val || '' })}
              errMessage={formState.errors.content?.message}
            />
          )}
        />

        <Controller
          name="target"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormInputRichText
              key={name}
              label="Mục tiêu bài giảng"
              value={value?.content}
              onChange={(val) => onChange({ content: val || '' })}
              errMessage={formState.errors.target?.message}
            />
          )}
        />

        <Controller
          name="requirement"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormInputRichText
              key={name}
              label="Yêu cầu cần đạt"
              value={value?.content}
              onChange={(val) => onChange({ content: val || '' })}
              errMessage={formState.errors.requirement?.message}
            />
          )}
        />

        <Controller
          name="numCredits"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormInputNumber
              key={name}
              label="Tổng số tín chỉ"
              value={value}
              onChange={onChange}
              errMessage={formState.errors.numCredits?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormInputRichText
              key={name}
              label="Mô tả"
              value={value?.content}
              onChange={(val) => onChange({ content: val || '' })}
              errMessage={formState.errors.description?.message}
            />
          )}
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
          name="video"
          control={control}
          render={({ field: { onChange, value, name } }) => (
            <FormInputVideo
              key={name}
              label={t('course:courseSectionTable.video')}
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
              fileInputRef={fileVideoInputRef}
              errMessage={formState.errors.video?.message}
              className="min-h-80"
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
      </section>
      <div className="flex items-center justify-end p-6 gap-4 border-t">
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
    </form>
  );
}

function getParentTags(allTags: IOption[], selectedTabs: string[] = []) {
  if (!selectedTabs || selectedTabs.length === 0) return '';
  // selectedTabs already contains tag IDs (values), just join them
  return selectedTabs.join(',');
}

export default CourseSectionForm;
