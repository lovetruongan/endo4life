import {
  IDoctorUserConversationCreateFormData,
  useDoctorUserConversationCreateFormSchema,
} from '@endo4life/feature-discussion';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';
import { RiAttachment2 } from 'react-icons/ri';
import { TbSend2 } from 'react-icons/tb';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { localUuid } from '@endo4life/util-common';
import { MediaGallery, mediaGalleryUtils } from '@endo4life/ui-common';
import { IMediaGalleryItem } from '@endo4life/types';
import { useToggle } from 'ahooks';
import { useAuthContext } from '@endo4life/feature-auth';
import {
  useResourceCreateContext,
  useResourceDetailContext,
} from '@endo4life/feature-resources';

interface IDoctorUserConversationFormInputProps {
  parentId?: string;
  onSubmit?: (formData: IDoctorUserConversationCreateFormData) => void;
}

export const DoctorUserConversationFormInput = ({
  parentId,
  onSubmit,
}: IDoctorUserConversationFormInputProps) => {
  const { userProfile } = useAuthContext();
  const { loading } = useResourceCreateContext();
  const { entityField, entityIdValue, resource } = useResourceDetailContext();
  const formRef = useRef<HTMLFormElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [typing, typingToggle] = useToggle();

  const DEFAULT_FORM_VALUE = {
    attachments: [],
    state: 'PUBLIC',
    type: resource?.type || 'IMAGE',
    [entityField]: entityIdValue,
    parentId: parentId,
    content: '',
  };

  const { control, handleSubmit, setValue, watch, reset } =
    useForm<IDoctorUserConversationCreateFormData>({
      resolver: yupResolver(useDoctorUserConversationCreateFormSchema()),
      mode: 'onChange',
      defaultValues: DEFAULT_FORM_VALUE,
    });

  const attachments = watch('attachments');

  const onRemovePreviewClick = useCallback(
    (item: IMediaGalleryItem) => {
      if (Number.isNaN(item.id)) return;
      const newAttachments = attachments.filter(
        (_, idx) => idx !== Number(item.id),
      );
      setValue('attachments', newAttachments);
    },
    [attachments, setValue],
  );

  const onFormSubmit = useCallback(
    (formData: IDoctorUserConversationCreateFormData) => {
      if (onSubmit) {
        onSubmit(formData);
      }
    },
    [onSubmit],
  );

  useEffect(() => {
    if (typing) {
      const timer = setTimeout(() => typingToggle.setLeft(), 5000);
      return () => clearTimeout(timer);
    }
  }, [typing, typingToggle]);

  return (
    <form
      id={`doctor-user-conversation-create-form-${parentId || 'root'}`}
      ref={formRef}
      className={clsx('')}
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        typingToggle.setLeft();
        handleSubmit((formData) => onFormSubmit(formData))();
        reset();
      }}
    >
      <div className="flex gap-2">
        <Avatar
          src={(userProfile as any)?.avatarLink}
          sx={{ width: 36, height: 36 }}
        >
          {!(userProfile as any)?.avatarLink &&
            (userProfile?.firstName?.charAt(0) ||
              userProfile?.lastName?.charAt(0) ||
              userProfile?.email?.charAt(0)?.toUpperCase())}
        </Avatar>
        <div className="flex flex-col w-full gap-1">
          <div className="flex items-center pr-4 border rounded-lg bg-[#efefef]">
            <Controller
              name="content"
              control={control}
              render={({ field: { onChange, value, name } }) => {
                return (
                  <input
                    className="flex-grow w-11/12 px-2 py-2 text-gray-700 rounded-md outline-none sm:px-4 bg-[#efefef]"
                    placeholder="Nhập câu hỏi cho chuyên gia"
                    type="text"
                    key={name}
                    value={value}
                    onChange={(event) => {
                      const value = event.target.value;
                      onChange(event);
                      if (value) {
                        typingToggle.setRight();
                      } else {
                        typingToggle.setLeft();
                      }
                    }}
                  />
                );
              }}
            />
            {typing && (
              <div className="min-w-20">
                <span className="text-xs text-gray-500">Đang nhập...</span>
              </div>
            )}
            {loading && (
              <div className="min-w-32">
                <span className="text-xs text-gray-500">
                  Đang gửi câu hỏi...
                </span>
              </div>
            )}
            <Tooltip title="Đính kèm tệp">
              <IconButton
                size="small"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  inputFileRef.current?.click();
                }}
              >
                <RiAttachment2 />
                <Controller
                  name="attachments"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <input
                      ref={inputFileRef}
                      multiple
                      type="file"
                      title="attachments"
                      key={name}
                      accept="image/png, image/gif, image/jpeg, image/jpg"
                      className="absolute top-0 left-0 w-0 h-0 opacity-0"
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        const files = event.target.files;
                        if (!files || files.length === 0) return;

                        onChange(
                          Array.from(files).map((file) => ({
                            id: localUuid(),
                            src: URL.createObjectURL(file),
                            fileName: file.name,
                            fileSize: file.size,
                            extension: file.type,
                            file: file,
                          })),
                        );
                        if (inputFileRef.current)
                          inputFileRef.current.value = '';
                      }}
                    />
                  )}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Gửi câu hỏi">
              <IconButton
                size="small"
                form={`doctor-user-conversation-create-form-${parentId || 'root'}`}
                className="text-gray-500 hover:text-gray-700"
                type="submit"
              >
                <TbSend2 />
              </IconButton>
            </Tooltip>
          </div>
          {!!attachments.length && (
            <div
              className={clsx(
                'flex items-end h-full gap-2 p-3 bg-[#efefef] rounded-lg',
              )}
            >
              <MediaGallery
                data={mediaGalleryUtils.fromInputAttachments(attachments)}
                hasRemoveIcon={true}
                onRemovePreviewClick={onRemovePreviewClick}
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
