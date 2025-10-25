import {
  ICommentCreateFormData,
  ICommentUpdateFormData,
  ICommentEntity,
} from 'libs/student-web/feature-discussion/src';
import { Avatar } from '@mui/material';
import { useToggle } from 'ahooks';
import moment from 'moment';
import styles from './DiscussionBox.module.css';
import clsx from 'clsx';
import { DiscussionFormInput } from './DiscussionFormInput';
import { DiscussionEditDialog } from './DiscussionEditDialog';
import { MediaGallery, mediaGalleryUtils } from '@endo4life/ui-common';
import { arrayUtils } from '@endo4life/util-common';
import { useAuthContext } from '@endo4life/feature-auth';

interface IDiscussBoxProps {
  discuss: ICommentEntity;
  children?: ICommentEntity[];
  onSubmit?: (formData: ICommentCreateFormData) => void;
  onUpdate?: (id: string, formData: ICommentUpdateFormData) => void;
}

export function DiscussionBox({
  discuss,
  children = [],
  onSubmit,
  onUpdate,
}: IDiscussBoxProps) {
  const { userProfile } = useAuthContext();
  const [openReplyBox, openReplyBoxToggle] = useToggle(false);
  const [openEditDialog, openEditDialogToggle] = useToggle(false);

  const canEdit = userProfile?.email === discuss.createdBy;

  return (
    <div
      className={clsx(styles['container'], {
        'flex items-start gap-2': true,
      })}
    >
      {/* avatar */}
      <Avatar
        src={discuss.createdByInfo?.avatarUrl}
        sx={{ width: 36, height: 36 }}
      >
        {!discuss.createdByInfo?.avatarUrl &&
          (discuss.createdByInfo?.firstName?.charAt(0) ||
            discuss.createdByInfo?.lastName?.charAt(0) ||
            discuss.createdBy?.charAt(0)?.toUpperCase())}
      </Avatar>
      {/* comment content section */}
      <div className="flex flex-col w-full gap-2">
        {/* comment box */}
        <div className="bg-[#efefef] rounded-xl py-3 px-4 gap-1 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {discuss.createdByInfo
                ? `${discuss.createdByInfo.firstName || ''} ${discuss.createdByInfo.lastName || ''}`.trim() ||
                  discuss.createdBy
                : discuss.createdBy}
            </span>
            <span className="text-xs text-neutral-500">
              {moment(discuss.createdAt).fromNow()}
            </span>
          </div>
          <span>{discuss.content}</span>
        </div>
        {/* attachment(s) box */}
        <div
          className={clsx('flex items-end max-h-32 gap-2', {
            hidden: !discuss.attachments?.length,
          })}
        >
          <MediaGallery
            data={mediaGalleryUtils.fromFetchedAttachments(
              arrayUtils.defaultArray(discuss.attachments),
            )}
          />
        </div>
        {/* action */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            title="reply-button"
            className="text-xs hover:underline"
            onClick={() => {
              openReplyBoxToggle.toggle();
            }}
          >
            Trả lời
          </button>
          {canEdit && (
            <button
              type="button"
              title="edit-button"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => {
                openEditDialogToggle.setRight();
              }}
            >
              Chỉnh sửa
            </button>
          )}
        </div>
        {/* form input */}
        {openReplyBox && (
          <DiscussionFormInput parentId={discuss.id} onSubmit={onSubmit} />
        )}
        {/* reply comment section */}
        <div className="">
          {children.map((child) => {
            return (
              <DiscussionBox
                key={child.id}
                discuss={child}
                onSubmit={onSubmit}
                onUpdate={onUpdate}
              />
            );
          })}
        </div>
      </div>
      {/* Edit dialog */}
      {openEditDialog && onUpdate && (
        <DiscussionEditDialog
          open={openEditDialog}
          comment={discuss}
          onClose={() => openEditDialogToggle.setLeft()}
          onSubmit={(id, formData) => {
            onUpdate(id, formData);
            openEditDialogToggle.setLeft();
          }}
        />
      )}
    </div>
  );
}
