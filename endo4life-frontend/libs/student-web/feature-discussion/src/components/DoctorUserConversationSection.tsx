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
  data?: IDoctorUserConversationEntity[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function DoctorUserConversationSection({
  discussAcceptable,
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
    <div
      className={clsx({
        'flex flex-col gap-4': true,
      })}
    >
      <ResourceCreateContext.Provider value={resourceCreateContextValue}>
        {discussAcceptable && (
          <DoctorUserConversationFormInput onSubmit={createConversation} />
        )}

        {!loading ? (
          !data.length || !data ? (
            <div className="flex flex-col items-center gap-4 p-4 text-slate-500">
              <RiCheckboxMultipleBlankLine className="text-4xl " />
              <span>Chưa có dữ liệu</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.map((conversation) => {
                const childrenConversations: IDoctorUserConversationEntity[] =
                  conversation.replies || [];
                return (
                  <DoctorUserConversationBox
                    key={conversation.id}
                    conversation={conversation}
                    children={childrenConversations}
                    onSubmit={createConversation}
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
