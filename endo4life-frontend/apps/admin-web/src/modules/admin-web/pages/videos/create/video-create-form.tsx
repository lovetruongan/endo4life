import {
  IVideoCreateFormData,
  VideoMapper,
  useVideoStateOptions,
  useVideoTagOptions,
} from '@endo4life/feature-videos';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  FormInputMultiSelect,
  FormInputRadio,
  FormInputText,
  FormInputTextarea,
  FormInputVideo,
  PageHeaderVideoDetail,
  InfoCard,
} from '@endo4life/ui-common';
import { IconButton, Tooltip } from '@mui/material';
import { VscArrowLeft } from 'react-icons/vsc';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import clsx from 'clsx';
import { ResourceState, UploadType } from '@endo4life/data-access';
import { useMemo, useRef, useState } from 'react';
import { FiCamera, FiCrop, FiDownload } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import {
  DATE_FORMAT,
  extractFileNameFromPresignedLink,
  formatDate,
  formatFileSize,
  getFileExtension,
  getFileSize,
  getVideoDimensions,
} from '@endo4life/util-common';
import { useToggle } from 'ahooks';
import { EnvConfig } from '@endo4life/feature-config';

interface IVideoCreateFormProps {
  loading?: boolean;
  onSubmit(data: IVideoCreateFormData): void;
}

export function VideoCreateForm({ loading, onSubmit }: IVideoCreateFormProps) {
  const { t } = useTranslation(['common', 'video']);
  const navigate = useNavigate();
  const location = useLocation();
  const videoMapper = new VideoMapper();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [changedVideoFile, changedVideoFileToggle] = useToggle<boolean>(false);
  const [isCroppingVideo, croppingVideoToggle] = useToggle<boolean>(false);
  const [currentDimensions, setCurrentDimensions] = useState<string>('');

  const schema = useMemo(() => {
    return yup.object({
      type: yup.string().default(UploadType.Multiple),
      files: yup.mixed(),
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

  const { control, handleSubmit, formState, getValues, watch } =
    useForm<IVideoCreateFormData>({
      resolver: yupResolver(schema),
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

  const { options: videoStateOptions } = useVideoStateOptions();
  const { options: tagOptions } = useVideoTagOptions({});
  const selectedParentTags = watch('metadata.0.tag');
  const { options: detailTagOptions } = useVideoTagOptions({
    parentTags: selectedParentTags,
  });
  const totalTags = useMemo(
    () => [...tagOptions, ...detailTagOptions],
    [tagOptions, detailTagOptions],
  );

  const formValues = watch();

  const onCropVideoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    croppingVideoToggle.toggle();
  };

  const onDownloadVideoClick = (event: React.MouseEvent) => {
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
        'videos',
      );
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }
  };

  return (
    <>
      <PageHeaderVideoDetail
        title={t('video:videoCreateForm.title')}
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
                  navigate(ADMIN_WEB_ROUTES.VIDEOS);
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
                navigate(ADMIN_WEB_ROUTES.VIDEOS);
              }}
            />
            <Button
              text={t('common:txtSave')}
              className="border-none hover:bg-opacity-70"
              variant="fill"
              requesting={loading}
              onClick={handleSubmit((data) => {
                onSubmit(videoMapper.toCreateVideoRequest(data, totalTags));
              })}
            />
          </div>
        }
      />
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit(videoMapper.toCreateVideoRequest(data, totalTags));
        })}
        className={clsx({
          'pointer-events-none cursor-default opacity-60': loading,
          'space-y-6 px-5': true,
        })}
      >
        <div className="grid w-full grid-cols-2 gap-5">
          {/* left */}
          <div className="flex flex-col h-full gap-5 p-5 bg-white rounded-md">
            {/* video picker */}
            <div className="flex items-center justify-center gap-4 rounded-lg">
              <Controller
                name="files.0"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputVideo
                    className="min-h-130"
                    value={value}
                    fileInputRef={fileInputRef}
                    isCroppingVideo={isCroppingVideo}
                    onCropVideoClick={onCropVideoClick}
                    onChange={async (selectedVideo: File) => {
                      onChange(selectedVideo);
                      changedVideoFileToggle.toggle();
                      setCurrentDimensions(
                        await getVideoDimensions(selectedVideo),
                      );
                      console.log(getVideoDimensions(selectedVideo));
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
                  label={t('video:basicInfo.createdAt')}
                  content={
                    location.pathname === ADMIN_WEB_ROUTES.VIDEO_CREATE
                      ? formatDate(new Date(), DATE_FORMAT)
                      : '_'
                  }
                />
                <InfoCard
                  label={t('video:basicInfo.size')}
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
                  label={t('video:basicInfo.dimension')}
                  content={currentDimensions || '-'}
                />
                <InfoCard
                  label={t('video:basicInfo.format')}
                  content={
                    formValues.files
                      ? getFileExtension(formValues.files[0])
                      : '_'
                  }
                />
              </div>
            </div>
            {/* action box */}
            <div className="grid items-center justify-center grid-cols-1 gap-2 overflow-x-hidden sm:grid-cols-2 md:flex justify-items-center">
              <Tooltip title={null} className="w-fit">
                <div>
                  <Button
                    className="border-slate-400"
                    variant="outline"
                    text={t('video:actions:changeVideo')}
                    textClassName="hidden lg:block"
                    disabled={!formValues?.files || !formValues?.files[0]}
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
              <Tooltip title={t('video:actions.cropVideo')} className="w-fit">
                <div>
                  <Button
                    className={clsx({
                      'transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white':
                        true,
                      'bg-primary-hover text-black': isCroppingVideo,
                    })}
                    variant="outline"
                    disabled={!formValues?.files}
                    startIcon={<FiCrop />}
                    onClick={onCropVideoClick}
                  />
                </div>
              </Tooltip>
              <Tooltip title={t('common:txtDownload')} className="w-fit">
                <div>
                  <Button
                    className="transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white"
                    variant="outline"
                    disabled={!formValues.files}
                    startIcon={<FiDownload />}
                    onClick={onDownloadVideoClick}
                  />
                </div>
              </Tooltip>
              <Tooltip title={t('video:actions.deleteVideo')} className="w-fit">
                <div>
                  <Button
                    className="transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white"
                    variant="outline"
                    startIcon={<RiDeleteBinLine />}
                    disabled={
                      location.pathname === ADMIN_WEB_ROUTES.VIDEO_CREATE ||
                      !formValues.files
                    }
                  />
                </div>
              </Tooltip>
            </div>
          </div>
          {/* right */}
          <div className="flex flex-col gap-5 p-5 bg-white rounded-md h-fit">
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.0.state"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputRadio
                    optionsClassName="flex gap-8"
                    label={t('video:basicInfo.state')}
                    options={videoStateOptions}
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
                    className="flex flex-col w-full"
                    key={name}
                    label={t('video:basicInfo.title')}
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
                    className="flex flex-col w-full"
                    key={name}
                    label={t('video:basicInfo.description')}
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
                    className="flex flex-col w-full"
                    options={tagOptions}
                    key={name}
                    label={t('video:basicInfo.tag')}
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
                    className="flex flex-col w-full"
                    options={detailTagOptions}
                    key={name}
                    label={t('video:basicInfo.detailTag')}
                    disabled={!selectedParentTags?.length}
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
