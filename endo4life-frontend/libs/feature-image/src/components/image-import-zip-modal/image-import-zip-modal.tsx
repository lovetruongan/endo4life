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
import { MdCheckCircle, MdCancel } from 'react-icons/md';
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
import { ZipUploadProgress } from '../../hooks/use-zip-upload-progress';

interface Props {
  loading?: boolean;
  onSubmit(data: IImageCreateFormData): void;
  progress?: ZipUploadProgress | null;
}

export function UploadZipModal({ loading, onSubmit, progress }: Props) {
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
      
      {/* Progress Display */}
      {progress && progress.status === 'PROCESSING' && (
        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Processing ZIP file...</span>
            <span className="text-sm text-blue-700">
              {progress.processed || 0}/{progress.total || 0}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress || 0}%` }}
            />
          </div>
          {progress.message && (
            <p className="text-xs text-blue-700">{progress.message}</p>
          )}
        </div>
      )}
      
      {progress && progress.status === 'SUCCESS' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900 flex items-center gap-1">
            <MdCheckCircle size={16} />
            {progress.message}
          </p>
        </div>
      )}
      
      {progress && progress.status === 'FAILED' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900 flex items-center gap-1">
            <MdCancel size={16} />
            {progress.message}
          </p>
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
