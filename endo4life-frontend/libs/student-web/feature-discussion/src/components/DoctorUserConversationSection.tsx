import {
  IDoctorUserConversationCreateFormData,
  IDoctorUserConversationEntity,
  useDoctorUserConversationCreate,
} from '@endo4life/feature-discussion';
import { RiCheckboxMultipleBlankLine } from 'react-icons/ri';
import clsx from 'clsx';
import { DoctorUserConversationFormInput } from './DoctorUserConversationFormInput';
import { DoctorUserConversationBox } from './DoctorUserConversationBox';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  ResourceCreateContext,
  ResourceCreateContextParams,
  ResourceDiscussionSkeleton,
} from '@endo4life/feature-resources';

interface IDoctorUserConversationSectionProps {
  discussAcceptable?: boolean;
  replyAcceptable?: boolean;
  data?: IDoctorUserConversationEntity[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function DoctorUserConversationSection({
  discussAcceptable,
  replyAcceptable = true,
  data = [],
  loading,
  onRefresh,
}: IDoctorUserConversationSectionProps) {
  const { mutation: createConversationMutation } =
    useDoctorUserConversationCreate();

  const resourceCreateContextValue: ResourceCreateContextParams = {
    loading: createConversationMutation.isLoading,
  };

  const createConversation = useCallback(
    (values: IDoctorUserConversationCreateFormData) => {
      if (!values.content) {
        toast.error('Thiếu thông tin cần thiết!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      createConversationMutation.mutate(values, {
        onSuccess(_data) {
          onRefresh && onRefresh();
          toast.success('Đã gửi câu hỏi thành công!', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
        onError(_error) {
          toast.error('Gửi câu hỏi thất bại! Vui lòng thử lại.', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      });
    },
    [createConversationMutation, onRefresh],
  );

  return (
    <div className="flex flex-col gap-4">
      <ResourceCreateContext.Provider value={resourceCreateContextValue}>
        {discussAcceptable && (
          <DoctorUserConversationFormInput onSubmit={createConversation} />
        )}

        {!loading ? (
          !data.length || !data ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-gray-500">
              <RiCheckboxMultipleBlankLine className="text-5xl text-gray-400" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  No questions yet
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Your questions will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.map((conversation) => {
                const childrenConversations: IDoctorUserConversationEntity[] =
                  conversation.replies || [];
                return (
                  <DoctorUserConversationBox
                    key={conversation.id}
                    conversation={conversation}
                    children={childrenConversations}
                    onSubmit={createConversation}
                    replyAcceptable={replyAcceptable}
                  />
                );
              })}
            </div>
          )
        ) : (
          <ResourceDiscussionSkeleton numOfDiscussions={10} />
        )}
      </ResourceCreateContext.Provider>
    </div>
  );
}

export default DoctorUserConversationSection;
