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
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Box,
  Paper,
  Typography,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { HiSparkles, HiChevronDown } from 'react-icons/hi2';
import { useMemo, useRef, useState, useCallback } from 'react';
import { useEffect } from 'react';
import {
  IImageUpdateFormData,
  ImageDeleteConfirmDialog,
  useImageDetailFormSchema,
  useImageStateOptions,
  useAIAnalysis,
} from '@endo4life/feature-image';
import {
  getFileExtension,
  getImageDimensions,
  extractFileNameFromPresignedLink,
  isFileValid,
  getFileExtensionFromUrl,
  getFileSizeFormatted,
  objectUtils,
  stringUtils,
  formatDate,
  DATE_FORMAT,
} from '@endo4life/util-common';
import { FiCamera, FiCrop, FiDownload } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useToggle } from 'ahooks';
import { useAllTagOptions, useTagOptionsByType } from '@endo4life/feature-tag';
import { EnvConfig } from '@endo4life/feature-config';
import { TagType } from '@endo4life/data-access';

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
  const anatomyLocationOptions = useTagOptionsByType(
    TagType.AnatomyLocationTag,
  );
  const hpOptions = useTagOptionsByType(TagType.HpTag);
  const lightOptions = useTagOptionsByType(TagType.LightTag);
  const upperGastroOptions = useTagOptionsByType(TagType.UpperGastroAnatomyTag);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [openDeleteDialog, deleteDialogToggle] = useToggle(false);
  const [isCropping, croppingToggle] = useToggle(false);
  const [currentDimensions, setCurrentDimensions] = useState(
    formData?.entity?.dimension,
  );
  const [remoteSize, setRemoteSize] = useState<string | undefined>(undefined);

  const { control, handleSubmit, formState, watch, reset } =
    useForm<IImageUpdateFormData>({
      resolver: yupResolver(useImageDetailFormSchema()),
      mode: 'onChange',
      defaultValues: {
        ...formData,
        file: {} as File,
      },
    });

  // AI Analysis
  const {
    analyze,
    result: aiResult,
    isLoading: isAnalyzing,
    clearResult,
  } = useAIAnalysis();
  const [showAIResults, setShowAIResults] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [expandedPredictions, setExpandedPredictions] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleAIAnalysis = useCallback(async () => {
    if (!imageId) return;
    try {
      await analyze(imageId);
      setShowAIResults(true);
      setShowOverlay(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  }, [imageId, analyze]);
  const { options: imageStateOptions } = useImageStateOptions();

  // Reset form when formData changes
  useEffect(() => {
    if (formData) {
      reset({
        ...formData,
        file: {} as File,
      });
    }
  }, [formData, reset]);

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
            {/* image picker with AI overlay */}
            <div
              ref={imageContainerRef}
              className="relative flex items-center justify-center gap-4 rounded-lg overflow-hidden"
            >
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

              {/* AI Analysis Overlay */}
              {showAIResults &&
                aiResult &&
                showOverlay &&
                aiResult.imageWidth > 0 && (
                  <AIOverlay
                    imageWidth={aiResult.imageWidth}
                    imageHeight={aiResult.imageHeight}
                    detections={aiResult.detections}
                    segmentation={aiResult.segmentation}
                    containerRef={imageContainerRef}
                  />
                )}
            </div>
            {/* derive dimension/size from resourceUrl if not provided by backend */}
            <DerivedInfoFromResourceUrl
              resourceUrl={formData?.resourceUrl || ''}
              setCurrentDimensions={setCurrentDimensions}
              setRemoteSize={setRemoteSize}
            />
            {/* info box */}
            <div className="grid items-center grid-cols-1 gap-4 px-5 py-4 rounded-lg md:grid-cols-2 h-fit bg-neutral-background-layer-2">
              {/* left */}
              <div className="flex flex-col items-start gap-4 overflow-x-hidden md:w-1/2">
                <InfoCard
                  label={t('image:basicInfo.createdAt')}
                  content={
                    formData?.entity?.createdAt
                      ? formatDate(
                          new Date(formData.entity.createdAt),
                          DATE_FORMAT,
                        )
                      : '-'
                  }
                />
                <InfoCard
                  label={t('image:basicInfo.size')}
                  content={
                    isFileValid(selectedFile)
                      ? getFileSizeFormatted(selectedFile, formData)
                      : remoteSize ||
                        getFileSizeFormatted(selectedFile, formData)
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
                <Tooltip title="Phân tích với AI" className="w-fit">
                  <div>
                    <Button
                      className="transition min-w-fit border-indigo-400 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700"
                      variant="outline"
                      startIcon={
                        isAnalyzing ? (
                          <CircularProgress size={16} />
                        ) : (
                          <HiSparkles />
                        )
                      }
                      disabled={
                        location.pathname === ADMIN_WEB_ROUTES.IMAGE_CREATE ||
                        isAnalyzing
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAIAnalysis();
                      }}
                    />
                  </div>
                </Tooltip>
              </div>
            )}

            {/* AI Analysis Results */}
            {showAIResults && aiResult && (
              <Paper className="p-4 mt-4 border border-indigo-200 bg-indigo-50">
                <Box className="flex items-center justify-between mb-3">
                  <Box className="flex items-center gap-2">
                    <HiSparkles className="text-indigo-600" />
                    <Typography variant="subtitle2" className="text-indigo-800">
                      Kết quả phân tích AI
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Tooltip
                      title={showOverlay ? 'Ẩn overlay' : 'Hiện overlay'}
                    >
                      <Chip
                        label={showOverlay ? 'Overlay: ON' : 'Overlay: OFF'}
                        size="small"
                        color={showOverlay ? 'primary' : 'default'}
                        onClick={() => setShowOverlay(!showOverlay)}
                        className="cursor-pointer"
                      />
                    </Tooltip>
                    <Button
                      variant="outline"
                      className="text-xs"
                      onClick={() => setShowAIResults(false)}
                    >
                      Đóng
                    </Button>
                  </Box>
                </Box>

                {/* Detections */}
                <Box className="mb-3">
                  <Typography
                    variant="caption"
                    className="text-gray-600 uppercase tracking-wider"
                  >
                    Phát hiện ({aiResult.detections?.length || 0})
                  </Typography>
                  <Box className="flex flex-wrap gap-1 mt-1">
                    {aiResult.detections?.map((detection, idx) => (
                      <Chip
                        key={idx}
                        label={`${detection.className} (${(detection.confidence * 100).toFixed(0)}%)`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {(!aiResult.detections ||
                      aiResult.detections.length === 0) && (
                      <Typography variant="body2" className="text-gray-500">
                        Không phát hiện tổn thương
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Classification with confidence bars */}
                {aiResult.classification && (
                  <Box className="mb-3">
                    <Typography
                      variant="caption"
                      className="text-gray-600 uppercase tracking-wider"
                    >
                      Phân loại
                    </Typography>
                    <Box className="grid grid-cols-2 gap-2 mt-1">
                      <Box className="p-2 bg-white rounded border">
                        <Typography variant="caption" className="text-gray-500">
                          HP Status
                        </Typography>
                        <Box className="flex items-center justify-between">
                          <Typography
                            variant="body2"
                            className="font-semibold text-indigo-700"
                          >
                            {aiResult.classification.hpStatus?.className || '-'}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            {(
                              (aiResult.classification.hpStatus?.confidence ||
                                0) * 100
                            ).toFixed(1)}
                            %
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (aiResult.classification.hpStatus?.confidence ||
                              0) * 100
                          }
                          className="mt-1"
                          sx={{ height: 6, borderRadius: 3 }}
                          color="primary"
                        />
                      </Box>
                      <Box className="p-2 bg-white rounded border">
                        <Typography variant="caption" className="text-gray-500">
                          Loại tổn thương
                        </Typography>
                        <Box className="flex items-center justify-between">
                          <Typography
                            variant="body2"
                            className="font-semibold text-orange-600"
                          >
                            {aiResult.classification.lesionType?.className ||
                              '-'}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            {(
                              (aiResult.classification.lesionType?.confidence ||
                                0) * 100
                            ).toFixed(1)}
                            %
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (aiResult.classification.lesionType?.confidence ||
                              0) * 100
                          }
                          className="mt-1"
                          sx={{ height: 6, borderRadius: 3 }}
                          color="warning"
                        />
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* All Predictions Expandable */}
                {aiResult.classification?.allPredictions && (
                  <Accordion
                    expanded={expandedPredictions}
                    onChange={() =>
                      setExpandedPredictions(!expandedPredictions)
                    }
                    className="mb-3 bg-white"
                    sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}
                  >
                    <AccordionSummary expandIcon={<HiChevronDown />}>
                      <Typography
                        variant="caption"
                        className="text-gray-600 uppercase tracking-wider"
                      >
                        Chi tiết dự đoán
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box className="grid grid-cols-2 gap-4">
                        {/* HP Status predictions */}
                        <Box>
                          <Typography
                            variant="caption"
                            className="text-gray-500 font-medium"
                          >
                            HP Status
                          </Typography>
                          {aiResult.classification.allPredictions.hp_status?.map(
                            (pred, i) => (
                              <Box
                                key={i}
                                className="flex items-center gap-2 mt-1"
                              >
                                <Typography
                                  variant="caption"
                                  className="w-24 truncate"
                                >
                                  {pred.className}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={pred.confidence * 100}
                                  className="flex-1"
                                  sx={{ height: 4, borderRadius: 2 }}
                                />
                                <Typography
                                  variant="caption"
                                  className="text-gray-500 w-12 text-right"
                                >
                                  {(pred.confidence * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                            ),
                          )}
                        </Box>
                        {/* Lesion Type predictions */}
                        <Box>
                          <Typography
                            variant="caption"
                            className="text-gray-500 font-medium"
                          >
                            Loại tổn thương
                          </Typography>
                          {aiResult.classification.allPredictions.lesion_type?.map(
                            (pred, i) => (
                              <Box
                                key={i}
                                className="flex items-center gap-2 mt-1"
                              >
                                <Typography
                                  variant="caption"
                                  className="w-24 truncate"
                                >
                                  {pred.className}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={pred.confidence * 100}
                                  className="flex-1"
                                  sx={{ height: 4, borderRadius: 2 }}
                                  color="warning"
                                />
                                <Typography
                                  variant="caption"
                                  className="text-gray-500 w-12 text-right"
                                >
                                  {(pred.confidence * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                            ),
                          )}
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Suggested Tags - Display only, user selects from dropdowns */}
                {aiResult.suggestedTags && (
                  <Box className="mb-3">
                    <Typography
                      variant="caption"
                      className="text-gray-600 uppercase tracking-wider"
                    >
                      Nhãn đề xuất
                    </Typography>
                    <Box className="flex flex-wrap gap-1 mt-1">
                      {aiResult.suggestedTags.tag?.map((tag, i) => (
                        <Chip
                          key={`tag-${i}`}
                          label={tag}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ))}
                      {aiResult.suggestedTags.detailTag?.map((tag, i) => (
                        <Chip
                          key={`detail-${i}`}
                          label={tag}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      ))}
                      {aiResult.suggestedTags.hpTag?.map((tag, i) => (
                        <Chip
                          key={`hp-${i}`}
                          label={tag}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Segmentation info */}
                {aiResult.segmentation?.masks &&
                  aiResult.segmentation.masks.length > 0 && (
                    <Box className="mb-3">
                      <Typography
                        variant="caption"
                        className="text-gray-600 uppercase tracking-wider"
                      >
                        Phân vùng ({aiResult.segmentation.masks.length} vùng)
                      </Typography>
                      <Box className="flex flex-wrap gap-1 mt-1">
                        {aiResult.segmentation.masks.map((mask, idx) => (
                          <Chip
                            key={idx}
                            label={`Vùng ${idx + 1}: ${mask.polygon?.length || 0} điểm, IoU: ${(mask.iouScore || 0).toFixed(2)}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                <Alert severity="info" sx={{ py: 0, fontSize: 12 }}>
                  Kết quả AI chỉ mang tính tham khảo. Thời gian xử lý:{' '}
                  {(aiResult.processingTimeMs / 1000)?.toFixed(1)}s
                </Alert>
              </Paper>
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
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.anatomyLocationTag"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    key={name}
                    className="flex flex-col w-full"
                    label="Anatomy Location"
                    isIgnoredValidating={true}
                    value={value}
                    options={anatomyLocationOptions.options}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.hpTag"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    key={name}
                    className="flex flex-col w-full"
                    label="HP Classification"
                    isIgnoredValidating={true}
                    value={value}
                    options={hpOptions.options}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.lightTag"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    key={name}
                    className="flex flex-col w-full"
                    label="Light Type"
                    isIgnoredValidating={true}
                    value={value}
                    options={lightOptions.options}
                    onSubmit={onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-4">
              <Controller
                name="metadata.upperGastroAnatomyTag"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <FormInputMultiSelect
                    key={name}
                    className="flex flex-col w-full"
                    label="Upper GI Anatomy"
                    isIgnoredValidating={true}
                    value={value}
                    options={upperGastroOptions.options}
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

interface DerivedInfoProps {
  resourceUrl: string;
  setCurrentDimensions: (val?: string) => void;
  setRemoteSize: (val?: string) => void;
}

function DerivedInfoFromResourceUrl({
  resourceUrl,
  setCurrentDimensions,
  setRemoteSize,
}: DerivedInfoProps) {
  useEffect(() => {
    let aborted = false;
    async function derive() {
      if (!resourceUrl) return;
      // Try to infer image dimensions by loading the image (if same-origin or CORS allowed)
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = resourceUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // ignore errors silently
        });
        if (!aborted && img.naturalWidth && img.naturalHeight) {
          setCurrentDimensions(`${img.naturalWidth} x ${img.naturalHeight}`);
        }
      } catch {
        // Silently ignore image load errors
      }

      // Try to get size via HEAD request
      try {
        const resp = await fetch(resourceUrl, { method: 'HEAD' });
        const len = resp.headers.get('content-length');
        if (!aborted && len) {
          const bytes = parseInt(len, 10);
          // Simple formatter (KB/MB)
          const k = 1000;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          const formatted =
            bytes && isFinite(i)
              ? `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
              : '0 B';
          setRemoteSize(formatted);
        }
      } catch {
        // Silently ignore HEAD request errors
      }
    }
    derive();
    return () => {
      aborted = true;
    };
  }, [resourceUrl, setCurrentDimensions, setRemoteSize]);
  return null;
}

// AI Analysis Overlay Component
interface AIOverlayProps {
  imageWidth: number;
  imageHeight: number;
  detections?: Array<{
    className: string;
    confidence: number;
    bbox: { x1: number; y1: number; x2: number; y2: number };
  }>;
  segmentation?: {
    masks: Array<{
      detectionIndex: number;
      polygon: Array<{ x: number; y: number }>;
    }>;
  };
  containerRef: React.RefObject<HTMLDivElement>;
}

function AIOverlay({
  imageWidth,
  imageHeight,
  detections,
  segmentation,
  containerRef,
}: AIOverlayProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const img = containerRef.current.querySelector('img');
        if (img) {
          setContainerSize({
            width: img.clientWidth,
            height: img.clientHeight,
          });
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    // Also observe for image load
    const img = containerRef.current?.querySelector('img');
    if (img) {
      img.addEventListener('load', updateSize);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      if (img) {
        img.removeEventListener('load', updateSize);
      }
    };
  }, [containerRef]);

  if (containerSize.width === 0 || containerSize.height === 0) return null;

  const scaleX = containerSize.width / imageWidth;
  const scaleY = containerSize.height / imageHeight;

  // Colors for different detections
  const colors = [
    { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },
    { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.2)' },
    { stroke: '#eab308', fill: 'rgba(234, 179, 8, 0.2)' },
    { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.2)' },
    { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' },
  ];

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: containerSize.width,
        height: containerSize.height,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
    >
      {/* Segmentation polygons (drawn first, behind bboxes) */}
      {segmentation?.masks?.map((mask, idx) => {
        const color = colors[idx % colors.length];
        const points = mask.polygon
          ?.map((p) => `${p.x * scaleX},${p.y * scaleY}`)
          .join(' ');

        if (!points) return null;

        return (
          <polygon
            key={`seg-${idx}`}
            points={points}
            fill={color.fill}
            stroke={color.stroke}
            strokeWidth="2"
            strokeDasharray="4,2"
          />
        );
      })}

      {/* Bounding boxes */}
      {detections?.map((detection, idx) => {
        const color = colors[idx % colors.length];
        const x = detection.bbox.x1 * scaleX;
        const y = detection.bbox.y1 * scaleY;
        const width = (detection.bbox.x2 - detection.bbox.x1) * scaleX;
        const height = (detection.bbox.y2 - detection.bbox.y1) * scaleY;

        return (
          <g key={`det-${idx}`}>
            {/* Bounding box */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="none"
              stroke={color.stroke}
              strokeWidth="3"
            />
            {/* Label background */}
            <rect
              x={x}
              y={y - 22}
              width={Math.max(width, 80)}
              height="22"
              fill={color.stroke}
            />
            {/* Label text */}
            <text
              x={x + 4}
              y={y - 6}
              fill="white"
              fontSize="12"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              {detection.className} {(detection.confidence * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
