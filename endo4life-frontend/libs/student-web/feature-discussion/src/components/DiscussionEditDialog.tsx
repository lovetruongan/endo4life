import {
  ICommentUpdateFormData,
  useCommentUpdateFormSchema,
  ICommentEntity,
} from '@endo4life/feature-discussion';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { RiAttachment2 } from 'react-icons/ri';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { localUuid } from '@endo4life/util-common';
import { MediaGallery, mediaGalleryUtils } from '@endo4life/ui-common';
import { IMediaGalleryItem } from '@endo4life/types';
import clsx from 'clsx';

interface IDiscussionEditDialogProps {
  open: boolean;
  comment: ICommentEntity;
  onClose: () => void;
  onSubmit: (id: string, formData: ICommentUpdateFormData) => void;
  loading?: boolean;
}

export const DiscussionEditDialog = ({
  open,
  comment,
  onClose,
  onSubmit,
  loading = false,
}: IDiscussionEditDialogProps) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, setValue, watch } =
    useForm<ICommentUpdateFormData>({
      resolver: yupResolver(useCommentUpdateFormSchema()),
      mode: 'onChange',
      defaultValues: {
        content: comment.content || '',
        attachments: [],
      },
    });

  const attachments = watch('attachments');

  const onRemovePreviewClick = useCallback(
    (item: IMediaGalleryItem) => {
      if (Number.isNaN(item.id)) return;
      const newAttachments =
        attachments?.filter((_, idx) => idx !== Number(item.id)) || [];
      setValue('attachments', newAttachments);
    },
    [attachments, setValue],
  );

  const onFormSubmit = useCallback(
    (formData: ICommentUpdateFormData) => {
      onSubmit(comment.id, formData);
    },
    [comment.id, onSubmit],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chỉnh sửa bình luận</DialogTitle>
      <DialogContent>
        <form
          id="comment-edit-form"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            handleSubmit(onFormSubmit)();
          }}
        >
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-[#fafafa]">
              <Controller
                name="content"
                control={control}
                render={({ field: { onChange, value, name } }) => {
                  return (
                    <textarea
                      className="flex-grow w-full px-3 py-2 text-gray-700 rounded-md outline-none bg-[#fafafa] min-h-[100px] resize-none"
                      placeholder="Nhập nội dung bình luận"
                      key={name}
                      value={value}
                      onChange={onChange}
                      rows={4}
                    />
                  );
                }}
              />
              <div className="flex flex-col gap-2">
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
              </div>
            </div>
            {!!attachments && attachments.length > 0 && (
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
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Hủy
        </Button>
        <Button
          type="submit"
          form="comment-edit-form"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#2c224c',
            '&:hover': {
              backgroundColor: '#1a1530',
            },
          }}
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
