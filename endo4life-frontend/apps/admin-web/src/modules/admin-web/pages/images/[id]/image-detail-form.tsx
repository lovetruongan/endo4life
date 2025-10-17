import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import {
  FormInputText,
  PageHeaderImageDetail,
  FormInputImage,
  InfoCard,
  FormInputRadio,
  FormInputTextarea,
  FormInputMultiSelect,
} from '@endo4life/ui-common';
import { Button } from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { VscArrowLeft } from 'react-icons/vsc';
import { IconButton, Tooltip } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import {
  IImageUpdateFormData,
  ImageDeleteConfirmDialog,
  useImageDetailFormSchema,
  useImageStateOptions,
} from '@endo4life/feature-image';
import {
  getFileExtension,
  getImageDimensions,
  extractFileNameFromPresignedLink,
  isFileValid,
  getFileExtensionFromUrl,
  getFileSizeFormatted,
  getFileFormat,
  objectUtils,
  stringUtils,
} from '@endo4life/util-common';
import { FiCamera, FiCrop, FiDownload } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useToggle } from 'ahooks';
import { useAllTagOptions } from '@endo4life/feature-tag';
import { EnvConfig } from '@endo4life/feature-config';

interface Props {
  loading?: boolean;
  formData?: IImageUpdateFormData;
  onSubmit(data: IImageUpdateFormData): void;
}

export function ImageDetailForm({ loading, formData, onSubmit }: Props) {
  const { id: imageId } = useParams();
  const { t } = useTranslation(['common', 'image']);
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: tagLoading, tagOptions } = useAllTagOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [openDeleteDialog, deleteDialogToggle] = useToggle(false);
  const [isCropping, croppingToggle] = useToggle(false);
  const [currentDimensions, setCurrentDimensions] = useState(
    formData?.entity?.dimension,
  );

  const { control, handleSubmit, formState, watch } =
    useForm<IImageUpdateFormData>({
      resolver: yupResolver(useImageDetailFormSchema()),
      mode: 'onChange',
      defaultValues: {
        ...formData,
        file: {} as File,
      },
    });
  const { options: imageStateOptions } = useImageStateOptions();

  const selectedFile = watch('file');

  const selectedTag = watch('metadata.tag');
  const detailTagOptions = useMemo(() => {
    const selectedOptions = tagOptions.filter((item) =>
      selectedTag?.includes(item.value),
    );
    const results = [];
    for (const option of selectedOptions) {
      for (const child of option.children || []) {
        results.push(child);
      }
    }
    return results;
  }, [selectedTag, tagOptions]);

  const onDownloadImageClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (formData?.resourceUrl) {
      const response = await fetch(formData.resourceUrl);

      const element = document.createElement('a');
      element.href = window.URL.createObjectURL(await response.blob());
      element.download = extractFileNameFromPresignedLink(
        formData.resourceUrl,
        EnvConfig.Endo4LifeServiceUrl,
        'images',
      );
      document.body.appendChild(element);
      element.click();

      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }
  };

  const onRemoveImageClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    deleteDialogToggle.toggle();
  };

  const onCropImageClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    croppingToggle.toggle();
  };

  return (
    <>
      <PageHeaderImageDetail
        title={t('image:imageDetailForm.title')}
        titleAction={
          <Tooltip title={t('common:txtBack')} className="text-black">
            <span>
              <IconButton
                size="medium"
                className="text-black"
                disabled={loading}
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  navigate(ADMIN_WEB_ROUTES.IMAGES);
                }}
              >
                <VscArrowLeft size={18} />
              </IconButton>
            </span>
          </Tooltip>
        }
        leading={
          <div className="flex items-center gap-2">
            <Button
              text={t('common:txtCancel')}
              className="border-none hover:bg-opacity-70"
              variant="outline"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                navigate(ADMIN_WEB_ROUTES.IMAGES);
              }}
            />
            <Button
              form="image-detail-form"
              text={t('common:txtSave')}
              className="border-none hover:bg-opacity-70"
              variant="fill"
              requesting={loading}
              disabled={formState.isSubmitting}
            />
          </div>
        }
      />
      <form
        id="image-detail-form"
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className={clsx({
          'pointer-events-none cursor-default opacity-60':
            loading || tagLoading,
          'space-y-6 px-5': true,
        })}
      >
        <div className="grid w-full grid-cols-2 gap-5">
          {/* left */}
          <div className="flex flex-col gap-5 p-5 bg-white rounded-md h-fit">
            {/* image picker */}
            <div className="flex items-center justify-center gap-4 rounded-lg">
              <Controller
                name="file"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputImage
                    fileInputRef={fileInputRef}
                    className="min-h-130"
                    value={objectUtils.defaultObject(value)}
                    resourceUrl={formData?.resourceUrl || ''}
                    isCropping={isCropping}
                    onCropImageClick={onCropImageClick}
                    onChange={async (selectedImage: File) => {
                      onChange(selectedImage);
                      setCurrentDimensions(
                        await getImageDimensions(selectedImage),
                      );
                    }}
                  />
                )}
              />
            </div>
            {/* info box */}
            <div className="grid items-center grid-cols-1 gap-4 px-5 py-4 rounded-lg md:grid-cols-2 h-fit bg-neutral-background-layer-2">
              {/* left */}
              <div className="flex flex-col items-start gap-4 overflow-x-hidden md:w-1/2">
                <InfoCard
                  label={t('image:basicInfo.createdAt')}
                  content={getFileFormat(
                    EnvConfig.Endo4LifeServiceUrl,
                    selectedFile,
                    formData,
                  )}
                />
                <InfoCard
                  label={t('image:basicInfo.size')}
                  content={getFileSizeFormatted(selectedFile, formData)}
                />
              </div>
              {/* right */}
              <div className="flex flex-col items-start gap-4 overflow-x-hidden md:w-1/2">
                <InfoCard
                  label={t('image:basicInfo.dimension')}
                  content={currentDimensions || '-'}
                />
                <InfoCard
                  label={t('image:basicInfo.format')}
                  content={
                    isFileValid(selectedFile)
                      ? getFileExtension(
                          objectUtils.defaultObject(selectedFile),
                        )
                      : getFileExtensionFromUrl(
                          formData?.resourceUrl || '',
                          EnvConfig.Endo4LifeServiceUrl,
                          'images',
                        )
                  }
                />
              </div>
            </div>
            {/* action box */}
            {!isCropping && (
              <div className="grid items-center justify-center grid-cols-1 gap-2 overflow-x-hidden sm:grid-cols-2 md:flex justify-items-center">
                <Tooltip title={null} className="w-fit">
                  <div>
                    <Button
                      className="transition border-slate-400 hover:bg-primary-hover hover:text-white"
                      textClassName="hidden lg:block"
                      variant="outline"
                      text={t('image:actions.changeImage')}
                      disabled={isCropping}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        fileInputRef?.current?.click();
                      }}
                    >
                      <FiCamera />
                    </Button>
                  </div>
                </Tooltip>
                <Tooltip title={t('image:actions.cropImage')} className="w-fit">
                  <div>
                    <Button
                      className={clsx({
                        'transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white':
                          true,
                        'bg-primary-hover text-black': isCropping,
                      })}
                      variant="outline"
                      disabled={!selectedFile}
                      startIcon={<FiCrop />}
                      onClick={onCropImageClick}
                    />
                  </div>
                </Tooltip>
                <Tooltip title={t('common:txtDownload')} className="w-fit">
                  <div>
                    <Button
                      className="transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white"
                      variant="outline"
                      disabled={!selectedFile || isCropping}
                      startIcon={<FiDownload />}
                      onClick={onDownloadImageClick}
                    />
                  </div>
                </Tooltip>
                <Tooltip
                  title={t('image:actions.deleteImage')}
                  className="w-fit"
                >
                  <div>
                    <Button
                      className="transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white"
                      variant="outline"
                      startIcon={<RiDeleteBinLine />}
                      disabled={
                        location.pathname === ADMIN_WEB_ROUTES.IMAGE_CREATE ||
                        !selectedFile
                      }
                      onClick={onRemoveImageClick}
                    />
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
          {/* right */}
          <div className="flex flex-col gap-5 p-5 bg-white rounded-md h-fit">
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.state"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputRadio
                    optionsClassName="flex gap-8"
                    name="metadata.state"
                    options={imageStateOptions}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.title"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputText
                    className="flex flex-col w-full"
                    key={name}
                    label={t('image:basicInfo.title')}
                    isRequired
                    value={value}
                    defaultValue={value}
                    onSubmit={onChange}
                    errMessage={
                      formState.errors?.metadata
                        ? formState.errors?.metadata?.title?.message
                        : ''
                    }
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.description"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputTextarea
                    className="flex flex-col w-full"
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
                name="metadata.tag"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    className="flex flex-col w-full"
                    options={tagOptions}
                    key={name}
                    label={t('image:basicInfo.tag')}
                    isIgnoredValidating={true}
                    value={value}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.detailTag"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    key={name}
                    className="flex flex-col w-full"
                    label={t('image:basicInfo.detailTag')}
                    isIgnoredValidating={true}
                    disabled={!selectedTag}
                    value={value}
                    options={detailTagOptions}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </form>
      {openDeleteDialog && (
        <ImageDeleteConfirmDialog
          id={stringUtils.defaultString(imageId)}
          onClose={deleteDialogToggle.setLeft}
        />
      )}
    </>
  );
}
export default ImageDetailForm;
