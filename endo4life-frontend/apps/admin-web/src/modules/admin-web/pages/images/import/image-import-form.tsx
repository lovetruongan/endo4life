import {
  IImageCreateFormData,
  UploadZipModal,
  ZipUploadProgress,
} from '@endo4life/feature-image';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  PageHeaderImageDetail,
} from '@endo4life/ui-common';
import { IconButton, Tooltip } from '@mui/material';
import { VscArrowLeft } from 'react-icons/vsc';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface Props {
  loading?: boolean;
  onSubmit(data: IImageCreateFormData): void;
  progress?: ZipUploadProgress | null;
}

export function ImageImportForm({ loading, onSubmit, progress }: Props) {
  const { t } = useTranslation(['common', 'image']);
  const navigate = useNavigate();

  return (
    <>
      <PageHeaderImageDetail
        title={t('image:actions.addFile')}
        titleAction={
          <Tooltip title={t('common.txtBack')} className="text-black">
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
              type="button"
              text={t('common:txtCancel')}
              className="border-none hover:bg-opacity-70"
              variant="outline"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                navigate(ADMIN_WEB_ROUTES.IMAGES);
              }}
            />
          </div>
        }
      />
      <div
        className={clsx({
          'pointer-events-none cursor-default opacity-60': loading,
          'space-y-6 px-5 h-full': true,
        })}
      >
        <div className="flex justify-center h-fit w-90">
          <div className="px-[120px] py-12 pb-20 border-2 shadow-xl rounded-2xl w-full bg-white h-full">
            <div className="flex justify-center mb-4">
              <img src="/images/logo.png" alt="Logo" className="w-32 h-32" />
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                {t('image:imageImportForm.title')}
              </h1>
              <p className="text-gray-500">
                {t('image:imageImportForm.subtitle')}
              </p>
            </div>
            <UploadZipModal loading={loading} onSubmit={onSubmit} progress={progress} />
          </div>
        </div>
      </div>
    </>
  );
}
