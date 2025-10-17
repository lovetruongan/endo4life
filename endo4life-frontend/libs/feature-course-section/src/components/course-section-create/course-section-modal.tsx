import { IconButton, Modal } from '@mui/material';
import { useCallback } from 'react';
import { ICourseSectionFormData } from '../../types';
import { toast } from 'react-toastify';
import { useCourseSectionCreate } from '../../hooks';
import { useParams } from 'react-router-dom';
import CourseSectionForm from '../course-section-form/course-section-form';
import { VscClose } from 'react-icons/vsc';
interface Props {
  onClose(): void;
}
export function CourseSectionCreateDialog({ onClose }: Props) {
  const { mutation: createCourseSectionMutation } = useCourseSectionCreate();
  const { id: courseId = '' } = useParams<{ id: string }>();

  const createCourseSection = useCallback(
    (values: ICourseSectionFormData) => {
      const finalValues = {
        ...values,
        courseId,
      };

      createCourseSectionMutation.mutate(finalValues, {
        onSuccess(data) {
          toast.success('Tạo bài giảng thành công!', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          onClose();
        },
        onError(error) {
          console.log(error);
          toast.error('Tạo bài giảng thất bại! Vui lòng thử lại.', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      });
    },
    [courseId, createCourseSectionMutation],
  );

  return (
    <Modal
      open
      onClose={onClose}
      className="flex items-start justify-center p-6 mt-8"
    >
      <section className="bg-white rounded-lg shadow w-full max-w-4xl">
        <header className="flex-none flex items-center gap-4 px-6 py-3 border-b">
          <h3 className="flex-auto text-lg font-semibold">Tạo bài giảng mới</h3>
          <IconButton onClick={onClose} className="flex-none">
            <VscClose size={18} />
          </IconButton>
        </header>
        <CourseSectionForm
          onSubmit={createCourseSection}
          loading={createCourseSectionMutation.isLoading}
          onClose={onClose}
          txtSubmit="Tạo mới"
        />
      </section>
    </Modal>
  );
}
