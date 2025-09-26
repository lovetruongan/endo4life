import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  FormImportMultiResource,
  FormInputRadio,
  FormInputText,
  FormInputTextarea,
  FormInputMultiSelect,
  Button,
} from '@endo4life/ui-common';
import { ResourceState, UploadType } from '@endo4life/data-access';
import { IImageCreateFormData, ImageMapper } from '../../types';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useImageStateOptions, useImageTagOptions } from '../../hooks';
import clsx from 'clsx';

interface Props {
  loading?: boolean;
  onSubmit(data: IImageCreateFormData): void;
}

export function UploadImageVideoModal({ loading, onSubmit }: Props) {
  const { t } = useTranslation(['common', 'image']);
  const imageMapper = new ImageMapper();
  const schema = React.useMemo(() => {
    return yup.object({
      type: yup.string().default(UploadType.Multiple),
      files: yup
        .array()
        .min(1, t('image:imageImportZipModal.compressedFileRequired'))
        .required(t('image:imageImportZipModal.compressedFileRequired')),
      metadata: yup.array().of(
        yup.object({
          title: yup
            .string()
            .required(
              t('common:txtRequiredField').replace(
                '{{field_name}}',
                t('Tiêu đề'),
              ),
            ),
          description: yup.string(),
          state: yup.string().default(ResourceState.Unlisted),
          tag: yup.array().of(yup.string()),
          detailTag: yup.array().of(yup.string()),
        }),
      ),
      compressedFile: yup.object(),
    });
  }, [t]);
  const { control, handleSubmit, formState, watch } =
    useForm<IImageCreateFormData>({
      resolver: yupResolver(schema),
      mode: 'onChange',
      defaultValues: {
        type: UploadType.Multiple,
        files: [],
        metadata: [
          {
            title: '',
            description: 'Mô tả mẫu',
            state: ResourceState.Unlisted,
            tag: [],
            detailTag: [],
          },
        ],
      },
    });

  const { options: imageStateOptions } = useImageStateOptions();
  const { options: tagOptions } = useImageTagOptions({});
  const selectedParentTags = watch('metadata.0.tag');
  const { options: detailTagOptions } = useImageTagOptions({
    parentTags: selectedParentTags,
  });
  const totalTags = React.useMemo(() => {
    return [...tagOptions, ...detailTagOptions];
  }, [tagOptions, detailTagOptions]);
  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(imageMapper.toCreateImageRequest(data, totalTags));
      })}
      className={clsx({
        'pointer-events-none cursor-default opacity-60': loading,
        'space-y-6 px-5 h-full': true,
      })}
    >
      <Controller
        name="files"
        control={control}
        render={({ field: { onChange, value, name } }) => (
          <FormImportMultiResource
            isRequired={true}
            value={value}
            onChange={onChange}
            accept="image/*,video/*"
            errMessage={formState.errors.files?.message}
          />
        )}
      />
      <div className="grid grid-cols-12 gap-3">
        {watch('files')?.map((file, index) => (
          <div
            key={index}
            className="flex flex-col col-span-3 gap-5 p-5 mt-4 bg-white border rounded-md shadow-lg border-slate-500"
          >
            <p className="h-5 text-sm font-medium text-green-500 truncate">
              {file.name}
            </p>
            <div className="flex items-center gap-4">
              <Controller
                name={`metadata.${index}.state`}
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputRadio
                    optionsClassName="flex gap-8"
                    options={imageStateOptions}
                    label={t('image:basicInfo.state')}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-4">
              <Controller
                name={`metadata.${index}.title`}
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputText
                    className="flex flex-col w-full text-xs"
                    key={name}
                    label={t('image:basicInfo.title')}
                    isRequired
                    value={value}
                    onSubmit={onChange}
                    errMessage={
                      formState.errors?.metadata
                        ? formState.errors?.metadata[index]?.title?.message
                        : ''
                    }
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-4">
              <Controller
                name={`metadata.${index}.description`}
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputTextarea
                    className="flex flex-col w-full text-xs"
                    key={name}
                    label={t('image:basicInfo.description')}
                    value={value}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-4">
              <Controller
                name={`metadata.${index}.tag`}
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    className="flex flex-col w-full text-xs"
                    options={tagOptions}
                    key={name}
                    label={t('image:basicInfo.tag')}
                    value={value}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-4">
              <Controller
                name={`metadata.${index}.detailTag`}
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    className="flex flex-col w-full text-xs"
                    options={detailTagOptions}
                    key={name}
                    label={t('image:basicInfo.detailTag')}
                    disabled={!selectedParentTags?.length}
                    value={value}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="submit"
        text={t('image:imageImportForm.importFiles')}
        className="w-full h-12 py-4 text-sm font-bold border-none px-9 hover:bg-opacity-70"
        variant="fill"
      />
    </form>
  );
}
