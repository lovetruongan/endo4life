import {
  IDoctorUserConversationCreateFormData,
  IDoctorUserConversationEntity,
} from 'libs/student-web/feature-discussion/src';
import { Avatar } from '@mui/material';
import { useToggle } from 'ahooks';
import moment from 'moment';
import clsx from 'clsx';
import { DoctorUserConversationFormInput } from './DoctorUserConversationFormInput';
import { MediaGallery, mediaGalleryUtils } from '@endo4life/ui-common';
import { arrayUtils } from '@endo4life/util-common';

interface IDoctorUserConversationBoxProps {
  conversation: IDoctorUserConversationEntity;
  children?: IDoctorUserConversationEntity[];
  onSubmit?: (formData: IDoctorUserConversationCreateFormData) => void;
}

export function DoctorUserConversationBox({
  conversation,
  children = [],
  onSubmit,
}: IDoctorUserConversationBoxProps) {
  const [openReplyBox, openReplyBoxToggle] = useToggle(false);

  const displayName = conversation.questionerInfo
    ? `${conversation.questionerInfo.firstName || ''} ${conversation.questionerInfo.lastName || ''}`.trim()
    : 'Người dùng';

  return (
    <div
      className={clsx({
        'flex items-start gap-2': true,
      })}
    >
      {/* avatar */}
      <Avatar
        src={
          conversation.questionerInfo?.avatarUrl ||
          'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fuser_3237472&psig=AOvVaw2FRSFHjkL-MFBpuip_GWSJ&ust=1731146097760000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLDEwfq7zIkDFQAAAAAdAAAAABAR'
        }
        sx={{ width: 36, height: 36 }}
      />
      {/* conversation content section */}
      <div className="flex flex-col w-full gap-2">
        {/* conversation box */}
        <div className="bg-[#efefef] rounded-xl py-3 px-4 gap-1 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{displayName}</span>
            <span className="text-xs text-neutral-500">
              {moment(conversation.createdAt).fromNow()}
            </span>
            {conversation.assigneeInfo && (
              <>
                <span className="text-xs text-neutral-500">•</span>
                <span className="text-xs text-blue-600">
                  Trả lời bởi:{' '}
                  {`${conversation.assigneeInfo.firstName || ''} ${conversation.assigneeInfo.lastName || ''}`.trim()}
                </span>
              </>
            )}
          </div>
          <span>{conversation.content}</span>
        </div>
        {/* attachment(s) box */}
        <div
          className={clsx('flex items-end max-h-32 gap-2', {
            hidden: !conversation.attachmentUrls?.length,
          })}
        >
          <MediaGallery
            data={mediaGalleryUtils.fromFetchedAttachments(
              arrayUtils.defaultArray(conversation.attachmentUrls),
            )}
          />
        </div>
        {/* action */}
        <div className="flex items-start">
          {!conversation.parentId && (
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
          )}
        </div>
        {/* form input */}
        {openReplyBox && (
          <DoctorUserConversationFormInput
            parentId={conversation.id}
            onSubmit={onSubmit}
          />
        )}
        {/* reply conversation section */}
        <div className="">
          {children.map((child) => {
            return (
              <DoctorUserConversationBox key={child.id} conversation={child} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
