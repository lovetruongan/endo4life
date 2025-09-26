import { useState, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import {
  Button,
  FormInputMultiSelect,
  FormInputRadio,
  FormInputText,
  FormInputTextarea,
  FormInputVideo,
  InfoCard,
  PageHeaderVideoDetail,
} from '@endo4life/ui-common';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@mui/material';
import { VscArrowLeft } from 'react-icons/vsc';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { ResourceState } from '@endo4life/data-access';
import { useAllTagOptions } from '@endo4life/feature-tag';
import {
  IVideoEntity,
  IVideoUpdateFormData,
  useVideoStateOptions,
  VideoDeleteConfirmDialog,
} from '@endo4life/feature-videos';
import { useToggle } from 'ahooks';
import {
  DATE_FORMAT,
  extractFileNameFromPresignedLink,
  formatDate,
  formatFileSize,
  getFileExtension,
  getFileExtensionFromUrl,
  getFileSize,
  getVideoDimensions,
  isFileValid,
  objectUtils,
  stringUtils,
} from '@endo4life/util-common';
import { EnvConfig } from '@endo4life/feature-config';
import { FiCamera, FiCrop, FiDownload } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';

interface Props {
  loading?: boolean;
  rawData: IVideoEntity;
  formData?: IVideoUpdateFormData;
  onSubmit(data: IVideoUpdateFormData): void;
}

export function VideoDetailForm({
  loading,
  rawData,
  formData,
  onSubmit,
}: Props) {
  const { id: videoId } = useParams();
  const { t } = useTranslation(['common', 'video']);
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: tagLoading, tagOptions } = useAllTagOptions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [openDeleteDialog, deleteDialogToggle] = useToggle(false);
  const [isCroppingVideo, croppingVideoToggle] = useToggle(false);
  const [currentDimensions, setCurrentDimensions] = useState(rawData.dimension);

  const schema = useMemo(() => {
    return yup.object({
      file: yup.mixed(),
      metadata: yup.object({
        title: yup
          .string()
          .required(
            t('common:txtRequiredField').replace(
              '{{field_name}}',
              t('Tên video'),
            ),
          ),
        description: yup.string(),
        state: yup.string().default(ResourceState.Unlisted),
        tag: yup.array().of(yup.string()),
        detailTag: yup.array().of(yup.string()),
      }),
      compressedFile: yup.object(),
    });
  }, [t]);

  const { control, handleSubmit, formState, watch } =
    useForm<IVideoUpdateFormData>({
      resolver: yupResolver(schema),
      mode: 'onChange',
      defaultValues: {
        ...formData,
        file: {} as File,
      },
    });

  const { options: videoStateOptions } = useVideoStateOptions();

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

  const onDownloadVideoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (formData?.resourceUrl) {
      const element = document.createElement('a');
      element.href = formData.resourceUrl;
      element.download = extractFileNameFromPresignedLink(
        formData.resourceUrl,
        EnvConfig.ElearningServiceUrl,
        'videos',
      );
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }
  };

  const onRemoveVideoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    deleteDialogToggle.toggle();
  };

  const onCropVideoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    croppingVideoToggle.toggle();
  };

  return (
    <>
      <PageHeaderVideoDetail
        title={t('video:videoDetailForm.title')}
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
              className="h-12 py-4 text-sm font-bold border-none px-9 hover:bg-opacity-70"
              variant="outline"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                navigate(ADMIN_WEB_ROUTES.VIDEOS);
              }}
            />
            <Button
              form="video-detail-form"
              text={t('common:txtSave')}
              className="h-12 py-4 text-sm font-bold border-none px-9 hover:bg-opacity-70"
              variant="fill"
              requesting={loading}
              disabled={formState.isSubmitting}
            />
          </div>
        }
      />
      <form
        id="video-detail-form"
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
            {/* video picker */}
            <div className="flex items-center justify-center gap-4 rounded-lg">
              <Controller
                name="file"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputVideo
                    fileInputRef={fileInputRef}
                    value={objectUtils.defaultObject(value)}
                    className="min-h-130"
                    resourceUrl={formData?.resourceUrl || ''}
                    isCroppingVideo={isCroppingVideo}
                    onCropVideoClick={onCropVideoClick}
                    onChange={async (selectedVideo: File) => {
                      onChange(selectedVideo);
                      setCurrentDimensions(
                        await getVideoDimensions(selectedVideo),
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
                  label={t('video:basicInfo.createdAt')}
                  content={
                    !isFileValid(selectedFile)
                      ? formatDate(
                          stringUtils.defaultString(
                            formData?.entity?.createdAt,
                          ),
                          DATE_FORMAT,
                        )
                      : formatDate(new Date(), DATE_FORMAT)
                  }
                />
                <InfoCard
                  label={t('video:basicInfo.size')}
                  content={
                    !isFileValid(selectedFile)
                      ? Number(+formData?.entity?.size?.split(' ')[0]!).toFixed(
                          3,
                        ) +
                        ' ' +
                        formData?.entity?.size?.split(' ')[1]
                      : formatFileSize(
                          getFileSize(objectUtils.defaultObject(selectedFile)),
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
                    isFileValid(selectedFile)
                      ? getFileExtension(
                          objectUtils.defaultObject(selectedFile),
                        )
                      : getFileExtensionFromUrl(
                          formData?.resourceUrl || '',
                          EnvConfig.ElearningServiceUrl,
                          'images',
                        )
                  }
                />
              </div>
            </div>
            {/* action box */}
            {!isCroppingVideo && (
              <div className="grid items-center justify-center grid-cols-1 gap-2 overflow-x-hidden sm:grid-cols-2 md:flex justify-items-center">
                <Tooltip title={null} className="w-fit">
                  <div>
                    <Button
                      className="transition border-slate-400 hover:bg-primary-hover hover:text-white"
                      variant="outline"
                      text={t('video:actions.changeVideo')}
                      textClassName="hidden lg:block"
                      disabled={
                        !watch().file || !watch()?.file || isCroppingVideo
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
                <Tooltip title={t('video:actions.cropVideo')} className="w-fit">
                  <div>
                    <Button
                      className={clsx({
                        'transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white':
                          true,
                        'bg-primary-hover text-black': isCroppingVideo,
                      })}
                      variant="outline"
                      disabled={!selectedFile}
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
                      disabled={!watch()?.file || isCroppingVideo}
                      startIcon={<FiDownload />}
                      onClick={onDownloadVideoClick}
                    />
                  </div>
                </Tooltip>
                <Tooltip
                  title={t('video:actions.deleteVideo')}
                  className="w-fit"
                >
                  <div>
                    <Button
                      className="transition min-w-fit border-slate-400 hover:bg-primary-hover hover:text-white"
                      variant="outline"
                      startIcon={<RiDeleteBinLine />}
                      disabled={
                        location.pathname === ADMIN_WEB_ROUTES.VIDEO_CREATE ||
                        !watch()?.file
                      }
                      onClick={onRemoveVideoClick}
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
                name="metadata.title"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputText
                    className="flex flex-col w-full"
                    key={name}
                    label={t('video:basicInfo.title')}
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
                    label={t('video:basicInfo.description')}
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
                    label={t('video:basicInfo.tag')}
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
                    className="flex flex-col w-full"
                    options={detailTagOptions}
                    key={name}
                    label={t('video:basicInfo.detailTag')}
                    isIgnoredValidating={true}
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
      {openDeleteDialog && (
        <VideoDeleteConfirmDialog
          id={stringUtils.defaultString(videoId)}
          onClose={deleteDialogToggle.setLeft}
        />
      )}
    </>
  );
}
export default VideoDetailForm;
