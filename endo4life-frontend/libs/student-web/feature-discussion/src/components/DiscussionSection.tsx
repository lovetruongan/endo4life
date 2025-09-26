import { ICommentCreateFormData, ICommentEntity, useCommentCreate } from "@endo4life/feature-discussion";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import styles from './DiscussionSection.module.css';
import clsx from "clsx";
import { DiscussionFormInput } from "./DiscussionFormInput";
import { DiscussionBox } from "./DiscussionBox";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { dateUtils, stringUtils } from "@endo4life/util-common";
import { ResourceCreateContext, ResourceCreateContextParams, ResourceDiscussionSkeleton } from "@endo4life/feature-resources";

interface IDiscussionSectionProps {
  discussAcceptable?: boolean;
  data?: ICommentEntity[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function DiscussionSection({
  discussAcceptable,
  data = [],
  loading,
  onRefresh,
}: IDiscussionSectionProps) {
  const { mutation: createCommentMutation } = useCommentCreate();

  const resourceCreateContextValue: ResourceCreateContextParams = {
    loading: createCommentMutation.isLoading,
  };

  const createComment = useCallback(
    (values: ICommentCreateFormData) => {
      if (!values.content) {
        toast.error('Thiếu thông tin cần thiết!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      createCommentMutation.mutate(values, {
        onSuccess(_data) {
          onRefresh && onRefresh();
        },
        onError(_error) {
          toast.error("Bình luận thất bại! Vui lòng thử lại.", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      });
    },
    [createCommentMutation],
  );

  return (
    <div className={clsx(styles["container"], {
      "flex flex-col gap-4": true,
    })}>
       <ResourceCreateContext.Provider value={resourceCreateContextValue}>
        {discussAcceptable && (
          <DiscussionFormInput
            onSubmit={createComment}
          />
        )}

        {!loading ? (
          (!data.length || !data)
          ? (
            <div className="flex flex-col items-center gap-4 p-4 text-slate-500">
              <RiCheckboxMultipleBlankLine className="text-4xl "/>
              <span>Chưa có dữ liệu</span>
            </div>
          )
          : (
            <div className="flex flex-col gap-2">
              {data.filter(discuss => !discuss.comment).map(discuss => {
                const childrenDiscuss: ICommentEntity[] = data
                  .filter(child => child.comment?.id === discuss.id)
                  .sort((a, b) => dateUtils.comparator(
                    stringUtils.defaultString(a.createdAt),
                    stringUtils.defaultString(b.createdAt),
                  ));
                return (
                  <DiscussionBox
                    key={discuss.id}
                    discuss={discuss}
                    children={childrenDiscuss}
                    onSubmit={createComment}
                  />
                );
              })}
            </div>
          )
        ): (
          <ResourceDiscussionSkeleton
            numOfDiscussions={10}
          />
        )}
      </ResourceCreateContext.Provider>
    </div>
  );
}

export default DiscussionSection;
