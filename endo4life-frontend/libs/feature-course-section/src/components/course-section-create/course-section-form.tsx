import {
  Button,
  FormInputSelect,
  FormSelectMulti,
  FormInputNumber,
  FormInputText,
  FormInputImage,
  FormInputVideo,
  FormInputTextarea,
} from '@endo4life/ui-common';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSubTagOptions, useTagOptions } from '@endo4life/feature-tag';
import { ICourseSectionCreateFormData } from '../../types';
import { useCourseStateOptions } from '../../hooks';
import { CourseState } from '@endo4life/data-access';
import { useRef } from 'react';
interface Props {
  loading?: boolean;
  onSubmit(data: ICourseSectionCreateFormData): void;
  onClose?(): void;
}

export function CourseSectionCreateForm({ loading, onClose, onSubmit }: Props) {
  const { t } = useTranslation(['common', 'course']);
  const { options: stateOptions } = useCourseStateOptions();
  const fileImageInputRef = useRef<HTMLInputElement>(null);
  const fileVideoInputRef = useRef<HTMLInputElement>(null);

  const schema = yup.object({
    courseSection: yup.object({
      title: yup.string().required(
        t('common:txtRequiredField', {
          field_name: t('course:basicInfo.courseSection'),
        }),
      ),
      state: yup
        .string()
        .default(CourseState.Private)
        .required(
          t('common:txtRequiredField', {
            field_name: t('course:basicInfo.state'),
          }),
        ),
      tags: yup.string().optional(),
      tagsDetail: yup.string().optional(),
      totalCredits: yup.number().optional(),
      attribute: yup
        .object({
          metadata: yup
            .object({
              description: yup.string().optional(),
              mainContent: yup.string().optional(),
              lessonObjectives: yup.string().optional(),
              target: yup.string().optional(),
            })
            .optional(),
        })
        .optional(),
    }),
    thumbnail: yup.mixed(),
    videoFile: yup.mixed(),
  });

  const { control, handleSubmit, formState, watch } =
    useForm<ICourseSectionCreateFormData>({
      resolver: yupResolver(schema),
      mode: 'onChange',
      defaultValues: {
        courseSection: {
          state: CourseState.Private,
        },
      },
    });

  const selectedTag = watch('courseSection.tags');

  const { options: allTagOptions } = useTagOptions(selectedTag);
  const { options: subTagOptions } = useSubTagOptions(selectedTag || '', '');

  return (
    <>
      <div className="flex justify-between items-center my-6">
        <h1 className="font-bold text-xl">
          {watch('courseSection.title') ? (
            watch('courseSection.title')
          ) : (
            <span className="text-red-200">
              Tên khoá học của bạn sẽ hiển thị ở đây
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            text={t('common:txtCancel')}
            className="w-24 py-2 h-11"
            variant="outline"
            onClick={onClose}
          />
          <Button
            form="course-section-create-form"
            text={t('common:txtSave')}
            className="w-24 py-2 h-11"
            variant="fill"
            requesting={loading}
          />
        </div>
      </div>
      <form
        id="course-section-create-form"
        onSubmit={handleSubmit(onSubmit)}
        className={clsx({
          'pointer-events-none cursor-default opacity-60': loading,
          'space-y-6': true,
        })}
      >
        <section className="grid gap-8 mb-6">
          <div id="info-basic" className="grid gap-4">
            <Controller
              name="courseSection.title"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormInputText
                  key={name}
                  label={t('course:courseSectionTable.title')}
                  value={value}
                  isRequired
                  onChange={onChange}
                  errMessage={formState.errors.courseSection?.title?.message}
                />
              )}
            />
            <Controller
              name="courseSection.attribute.metadata.mainContent"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputTextarea
                    key={name}
                    label={t('course:courseSectionTable.mainContent')}
                    value={value}
                    onSubmit={onChange}
                    errMessage={
                      formState.errors.courseSection?.attribute?.metadata
                        ?.mainContent?.message
                    }
                  />
                );
              }}
            />
            <Controller
              name="courseSection.attribute.metadata.target"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputTextarea
                    key={name}
                    label={t('course:courseSectionTable.target')}
                    value={value}
                    onChange={onChange}
                    errMessage={
                      formState.errors.courseSection?.attribute?.metadata
                        ?.target?.message
                    }
                  />
                );
              }}
            />
            <Controller
              name="courseSection.attribute.metadata.lessonObjectives"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputTextarea
                    key={name}
                    label={t('course:courseSectionTable.lessonObjectives')}
                    value={value}
                    onChange={onChange}
                    errMessage={
                      formState.errors.courseSection?.attribute?.metadata
                        ?.target?.message
                    }
                  />
                );
              }}
            />
            <Controller
              name="courseSection.state"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputSelect
                    className="flex-1 font-medium"
                    label={t('course:courseSectionTable.state')}
                    placeholder={t('course:courseSectionTable.state')}
                    value={value}
                    options={stateOptions}
                    onSubmit={onChange}
                    errMessage={formState.errors.courseSection?.state?.message}
                  />
                );
              }}
            />
            <Controller
              name="courseSection.totalCredits"
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormInputNumber
                  className="flex-auto"
                  label={t('course:courseSectionTable.totalCredits')}
                  value={value}
                  onChange={(val) => {
                    if (val !== undefined && val < 0) {
                      onChange(0);
                    } else onChange(val);
                  }}
                />
              )}
            />
            <Controller
              name="courseSection.attribute.metadata.description"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <FormInputTextarea
                    key={name}
                    label={t('course:courseSectionTable.description')}
                    value={value}
                    onChange={onChange}
                    errMessage={
                      formState.errors.courseSection?.attribute?.metadata
                        ?.description?.message
                    }
                  />
                );
              }}
            />
            <Controller
              name="courseSection.tags"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormSelectMulti
                  className="flex flex-col w-full text-xs"
                  options={allTagOptions}
                  key={name}
                  label={t('course:courseSectionTable.tag')}
                  value={value?.split(',')}
                  placeholder="Chọn nhãn"
                  onChange={(val) => onChange(val.join(','))}
                />
              )}
            />
            <Controller
              name="courseSection.tagsDetail"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <FormSelectMulti
                  disabled={!selectedTag}
                  className="flex flex-col w-full text-xs"
                  options={subTagOptions}
                  key={name}
                  label={t('course:courseSectionTable.detailTag')}
                  value={value?.split(',')}
                  placeholder="Chọn nhãn chi tiết"
                  onChange={(val) => onChange(val.join(','))}
                />
              )}
            />
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-8">
                <Controller
                  name="videoFile"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <FormInputVideo
                      key={name}
                      label={t('course:courseSectionTable.video')}
                      value={value}
                      onChange={onChange}
                      fileInputRef={fileVideoInputRef}
                      errMessage={formState.errors.videoFile?.message}
                      className="min-h-80"
                    />
                  )}
                />
              </div>
              <div className="col-span-4">
                <Controller
                  name="thumbnail"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <FormInputImage
                      className="min-h-60"
                      key={name}
                      label={t('course:courseSectionTable.thumbnail')}
                      value={value}
                      onChange={onChange}
                      fileInputRef={fileImageInputRef}
                      errMessage={formState.errors.thumbnail?.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </section>
      </form>
    </>
  );
}

export default CourseSectionCreateForm;
