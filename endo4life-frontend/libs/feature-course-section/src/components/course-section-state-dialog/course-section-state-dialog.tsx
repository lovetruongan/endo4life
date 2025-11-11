import { Modal } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CourseSectionStateForm from './course-section-state-form';
import { useCallback } from 'react';
import { ICourseSectionFormData } from '../../types';
import { toast } from 'react-toastify';
import { useCourseSectionUpdate } from '../../hooks/use-course-section-update';
import { CourseState } from '@endo4life/data-access';

interface Props {
  onClose(): void;
  courseSectionId: string;
  state?: CourseState | string;
}

export function CourseSectionStateDialog({
  courseSectionId,
  state,
  onClose,
}: Props) {
  const { t } = useTranslation('course');
  const { mutation: updateCourseSectionMutation } = useCourseSectionUpdate();

  const updateStateCourseSection = useCallback(
    (values: ICourseSectionFormData) => {
      if (!values.id) {
        toast.error('Id của bài giảng không tồn tại.', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }

      if (!values.state) {
        toast.error('Trạng thái không được để trống.', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }

      // Only update the state field, other fields are preserved by the backend
      const updateData: ICourseSectionFormData = {
        id: values.id,
        state: values.state,
      };

      // Log for debugging
      console.log('Updating course section state:', {
        courseSectionId: updateData.id,
        state: updateData.state,
        stateType: typeof updateData.state,
      });

      updateCourseSectionMutation.mutate(updateData, {
        onSuccess() {
          toast.success('Cập nhật trạng thái bài giảng thành công', {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          onClose();
        },
        onError(error) {
          toast.error('Cập nhật trạng thái bài giảng thất bại', {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          console.error('Lỗi khi gọi API:', error);
        },
      });
    },
    [updateCourseSectionMutation, onClose],
  );

  return (
    <Modal
      open
      onClose={onClose}
      className="flex items-start justify-center py-20"
    >
      <section className="w-full max-w-xl bg-white rounded shadow">
        <header className="flex items-center gap-4 p-6 pb-0">
          <h2 className="flex-auto font-semibold text-title">
            Chỉnh sửa trạng thái bài giảng
          </h2>
        </header>
        <div className="p-6">
          <CourseSectionStateForm
            courseSectionId={courseSectionId}
            state={state}
            onClose={onClose}
            onSubmit={updateStateCourseSection}
          />
        </div>
      </section>
    </Modal>
  );
}

export default CourseSectionStateDialog;

