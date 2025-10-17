import clsx from 'clsx';
import { Button, FormInputRadio } from '@endo4life/ui-common';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ResourceState } from '@endo4life/data-access';
import { IImageUpdateFormData } from '../../types';
import { useImageStateOptions } from '../../hooks';

interface Props {
  imageId: string;
  state?: ResourceState;
  onClose(): void;
  onSubmit(data: IImageUpdateFormData): void;
}

export const ImageStateForm = ({
  imageId,
  state,
  onClose,
  onSubmit,
}: Props) => {
  const { options: imageStateOptions } = useImageStateOptions();
  const schema = yup.object().shape({
    id: yup.string().required(),
    metadata: yup.object({
      state: yup
        .mixed<ResourceState>()
        .oneOf([ResourceState.Public, ResourceState.Unlisted])
        .required('Vui lòng chọn trạng thái hiển thị'),
    }),
  });

  const { control, handleSubmit } = useForm<IImageUpdateFormData>({
    resolver: yupResolver(schema),
    defaultValues: { id: imageId, metadata: { state } },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-6')}>
      <Controller
        name="metadata.state"
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormInputRadio
            label="Chỉnh sửa chế độ hiển thị hình ảnh"
            options={imageStateOptions}
            value={value}
            onChange={onChange}
            optionsClassName="flex flex-col gap-2"
          />
        )}
      />
      <div className="flex items-center justify-end gap-2 pt-4">
        <Button
          text="Huỷ"
          onClick={(evt) => {
            evt.preventDefault();
            onClose();
          }}
          className="h-12 py-2 text-sm font-bold px-9 border-1"
          variant="outline"
        />
        <Button
          text="Cập nhật"
          type="submit"
          variant="fill"
          className="h-12 py-4 text-sm font-bold px-9"
        />
      </div>
    </form>
  );
};

export default ImageStateForm;
