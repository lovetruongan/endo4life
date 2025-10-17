import {
  IImageCreateFormData,
  useImageCreateFormSchema,
  useImageStateOptions,
} from '@endo4life/feature-image';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  FormInputMultiSelect,
  FormInputRadio,
  FormInputText,
  FormInputTextarea,
  FormInputImage,
  PageHeaderImageDetail,
  InfoCard,
} from '@endo4life/ui-common';
import { IconButton, Tooltip } from '@mui/material';
import { VscArrowLeft } from 'react-icons/vsc';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import clsx from 'clsx';
import { ResourceState, UploadType } from '@endo4life/data-access';
import { useMemo, useRef, useState } from 'react';
import { FiCamera } from 'react-icons/fi';
import { FiCrop } from 'react-icons/fi';
import { FiDownload } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import {
  DATE_FORMAT,
  extractFileNameFromPresignedLink,
  formatDate,
  formatFileSize,
  getFileExtension,
  getFileSize,
  getImageDimensions,
} from '@endo4life/util-common';
import { useToggle } from 'ahooks';
import { EnvConfig } from '@endo4life/feature-config';
import { useAllTagOptions } from '@endo4life/feature-tag';

interface IImageCreateFormProps {
  loading?: boolean;
  onSubmit(data: IImageCreateFormData): void;
}

export function ImageCreateForm({ loading, onSubmit }: IImageCreateFormProps) {
  const { t } = useTranslation(['common', 'image']);
  const navigate = useNavigate();
  const location = useLocation();
  const { tagOptions } = useAllTagOptions();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCropping, croppingToggle] = useToggle<boolean>(false);
  const [currentDimensions, setCurrentDimensions] = useState<string>('');

  const { control, handleSubmit, formState, watch } =
    useForm<IImageCreateFormData>({
      resolver: yupResolver(useImageCreateFormSchema()),
      mode: 'onChange',
      defaultValues: {
        type: UploadType.Multiple,
        files: [],
        metadata: [
          {
            title: '',
            description: '',
            state: ResourceState.Unlisted,
            tag: [],
            detailTag: [],
          },
        ],
      },
    });

  const { options: imageStateOptions } = useImageStateOptions();

  const selectedTag = watch('metadata.0.tag');
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

  const formValues = watch();

  const onCropImageClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    croppingToggle.toggle();
  };

  const onDownloadImageClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!formValues.files) return;
    const fileUrl = URL.createObjectURL(formValues.files[0]);
    if (fileUrl) {
      const element = document.createElement('a');
      element.href = fileUrl;
      element.download = extractFileNameFromPresignedLink(
        fileUrl,
        EnvConfig.Endo4LifeServiceUrl,
        'images',
      );
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }
  };

  return (
    <>
      <PageHeaderImageDetail
        title={t('image:imageCreateForm.title')}
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
            />
          </div>
        }
      />
      <form
        id="image-detail-form"
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className={clsx({
          'pointer-events-none cursor-default opacity-60': loading,
          'space-y-6 px-5': true,
        })}
      >
        <div className="grid w-full grid-cols-2 gap-5">
          {/* left */}
          <div className="flex flex-col h-full gap-5 p-5 bg-white rounded-md">
            {/* image picker */}
            <div className="flex items-center justify-center gap-4 rounded-lg">
              <Controller
                name="files.0"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputImage
                    className="min-h-130"
                    value={value}
                    resourceUrl={''}
                    fileInputRef={fileInputRef}
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
                  content={
                    location.pathname === ADMIN_WEB_ROUTES.IMAGE_CREATE
                      ? formatDate(new Date(), DATE_FORMAT)
                      : '_'
                  }
                />
                <InfoCard
                  label={t('image:basicInfo.size')}
                  content={
                    !formValues.files
                      ? '-'
                      : formatFileSize(
                          getFileSize(formValues.files[0] || ({} as File)),
                          2,
                        )
                  }
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
                    formValues.files
                      ? getFileExtension(formValues.files[0])
                      : '_'
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
                      className="border-slate-400"
                      textClassName="hidden lg:block"
                      variant="outline"
                      text={t('image:actions:changeImage')}
                      disabled={
                        !formValues?.files ||
                        !formValues?.files[0] ||
                        isCropping
                      }
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
                      disabled={!(formValues.files && formValues.files[0])}
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
                      disabled={!formValues.files || isCropping}
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
                        !formValues.files
                      }
                    />
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
          {/* right */}
          <div className="flex flex-col gap-5 p-5 bg-white rounded-md">
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.0.state"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputRadio
                    optionsClassName="flex gap-8"
                    label={t('image:basicInfo.state')}
                    options={imageStateOptions}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.0.title"
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
                        ? formState.errors?.metadata[0]?.title?.message
                        : ''
                    }
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.0.description"
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
                name="metadata.0.tag"
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
                name="metadata.0.detailTag"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    className="flex flex-col w-full text-xs"
                    options={detailTagOptions}
                    key={name}
                    label={t('image:basicInfo.detailTag')}
                    disabled={!selectedTag}
                    value={value}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
