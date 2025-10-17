import clsx from 'clsx';
import { Button, FormInputRadio } from '@endo4life/ui-common';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ResourceState } from '@endo4life/data-access';
import { IVideoUpdateFormData } from '../../types';
import { useVideoStateOptions } from '../../hooks';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  videoId: string;
  state?: ResourceState;
  onClose(): void;
  onSubmit(data: IVideoUpdateFormData): void;
}

export const VideoStateForm = ({
  videoId,
  state,
  onClose,
  onSubmit,
}: Props) => {
  const { t } = useTranslation(['common', 'video']);
  const { options: videoStateOptions } = useVideoStateOptions();
  const schema = yup.object().shape({
    id: yup.string().required(),
    metadata: yup.object({
      state: yup
        .mixed<ResourceState>()
        .oneOf([ResourceState.Public, ResourceState.Unlisted])
        .required(
          t(
            'common:txtRequiredField'.replace(
              '{{field_name}}',
              t('video:basicInfo.state'),
            ),
          ),
        ),
    }),
  });

  const { control, handleSubmit } = useForm<IVideoUpdateFormData>({
    resolver: yupResolver(schema),
    defaultValues: { id: videoId, metadata: { state } },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-6')}>
      <Controller
        name="metadata.state"
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormInputRadio
            label={t('video:videoStateForm.subtitle')}
            options={videoStateOptions}
            value={value}
            onChange={onChange}
            optionsClassName="flex flex-col gap-2"
          />
        )}
      />
      <div className="flex items-center justify-end gap-2 pt-4">
        <Button
          text={t('common:txtCancel')}
          onClick={(evt) => {
            evt.preventDefault();
            onClose();
          }}
          className="h-12 py-2 text-sm font-bold px-9 border-1"
          variant="outline"
        />
        <Button
          text={t('common:txtSubmit')}
          type="submit"
          variant="fill"
          className="h-12 py-4 text-sm font-bold px-9"
        />
      </div>
    </form>
  );
};

export default VideoStateForm;
