import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  Button,
  FormImportSingleResource,
  InfoCard,
} from '@endo4life/ui-common';
import { UploadType } from '@endo4life/data-access';
import { IImageCreateFormData, ImageMapper } from '../../types';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImageTagOptions } from '../../hooks';
import clsx from 'clsx';
import {
  DATE_FORMAT,
  formatDate,
  getFileExtension,
  formatFileSize,
  getImageDimensions,
} from '@endo4life/util-common';

interface Props {
  loading?: boolean;
  onSubmit(data: IImageCreateFormData): void;
}

export function UploadZipModal({ loading, onSubmit }: Props) {
  const { t } = useTranslation(['common', 'image']);
  const imageMapper = new ImageMapper();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const schema = React.useMemo(() => {
    return yup.object({
      type: yup.string().default(UploadType.Compressed),
      compressedFile: yup
        .mixed()
        .required(t('image:imageImportZipModal.compressedFileRequired')),
    });
  }, []);

  const { control, handleSubmit, formState } = useForm<IImageCreateFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      type: UploadType.Compressed,
      compressedFile: undefined,
    },
  });

  const { options: tagOptions } = useImageTagOptions({});

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(imageMapper.toCreateImageRequest(data, tagOptions));
      })}
      className={clsx({
        'pointer-events-none cursor-default opacity-60': loading,
        'space-y-6 px-5 h-full': true,
      })}
    >
      <h1 className="text-lg font-semibold">
        {t('image:imageImportZipModal.onlyOneZipAllowed')}
      </h1>
      <Controller
        name="compressedFile"
        control={control}
        render={({ field: { onChange } }) => (
          <FormImportSingleResource
            isRequired={true}
            onChange={(file) => {
              onChange(file);
              setUploadedFile(file);
            }}
            accept=".zip"
            errMessage={formState.errors.compressedFile?.message}
          />
        )}
      />
      {uploadedFile && (
        <div className="grid items-center grid-cols-2 gap-4 px-5 py-4 rounded-lg h-fit bg-neutral-background-layer-2">
          <div className="flex flex-col items-start w-1/2 gap-4">
            <InfoCard
              label={t('image:basicInfo.createdAt')}
              content={formatDate(new Date(), DATE_FORMAT)}
            />
            <InfoCard
              label={t('image:basicInfo.size')}
              content={formatFileSize(uploadedFile.size, 2)}
            />
          </div>
          <div className="flex flex-col items-start w-1/2 gap-4">
            <InfoCard label={t('image:basicInfo.dimension')} content={'-'} />
            <InfoCard
              label={t('image:basicInfo.format')}
              content={getFileExtension(uploadedFile)}
            />
          </div>
        </div>
      )}
      <Button
        type="submit"
        text={t('image:imageImportZipModal.uploadZip')}
        className="w-full h-12 py-4 text-sm font-bold border-none px-9 hover:bg-opacity-70"
        variant="fill"
        disabled={loading}
      />
    </form>
  );
}
