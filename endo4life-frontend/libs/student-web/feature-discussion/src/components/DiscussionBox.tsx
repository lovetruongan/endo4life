import { ICommentCreateFormData, ICommentEntity } from "libs/student-web/feature-discussion/src";
import { Avatar } from "@mui/material";
import { useToggle } from "ahooks";
import moment from "moment";
import styles from './DiscussionBox.module.css';
import clsx from "clsx";
import { DiscussionFormInput } from "./DiscussionFormInput";
import { MediaGallery, mediaGalleryUtils } from "@endo4life/ui-common";
import { arrayUtils } from "@endo4life/util-common";

interface IDiscussBoxProps {
  discuss: ICommentEntity;
  children?: ICommentEntity[];
  onSubmit?: (formData: ICommentCreateFormData) => void;
}

export function DiscussionBox({
  discuss,
  children = [],
  onSubmit,
}: IDiscussBoxProps) {
  const [openReplyBox, openReplyBoxToggle] = useToggle(false);
  
  return (
    <div
      className={clsx(styles["container"], {
        "flex items-start gap-2": true,
      })}
    >
      {/* avatar */}
      <Avatar
        src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fuser_3237472&psig=AOvVaw2FRSFHjkL-MFBpuip_GWSJ&ust=1731146097760000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLDEwfq7zIkDFQAAAAAdAAAAABAR"
        sx={{ width: 36, height: 36 }}
      />
      {/* comment content section */}
      <div
        className="flex flex-col w-full gap-2"
      >
        {/* comment box */}
        <div className="bg-[#efefef] rounded-xl py-3 px-4 gap-1 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{discuss.createdBy}</span>
            <span className="text-xs text-neutral-500">{moment(discuss.createdAt).fromNow()}</span>
          </div>
          <span>{discuss.content}</span>
        </div>
        {/* attachment(s) box */}
        <div className={clsx("flex items-end max-h-32 gap-2", {
          "hidden": !discuss.attachments?.length
        })}>
          <MediaGallery
            data={mediaGalleryUtils.fromFetchedAttachments(arrayUtils.defaultArray(discuss.attachments))}
          />
        </div>
        {/* action */}
        <div className="flex items-start">
          {!discuss.comment && (
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
          <DiscussionFormInput
            parentId={discuss.id}
            onSubmit={onSubmit}
          />
        )}
        {/* reply comment section */}
        <div className="">
          {children.map(child => {
            return (
              <DiscussionBox
                key={child.id}
                discuss={child}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}