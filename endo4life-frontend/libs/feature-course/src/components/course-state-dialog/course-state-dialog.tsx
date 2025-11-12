import { Modal } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CourseStateForm from './course-state-form';
import { useCallback } from 'react';
import { ICourseFormData } from '../../types';
import { toast } from 'react-toastify';
import { useCourseUpdate } from '../../hooks/use-course-update';
import { useCourseGetById } from '../../hooks/use-course-get-by-id';
import { CourseState } from '@endo4life/data-access';
import { useQueryClient } from 'react-query';
import { REACT_QUERY_KEYS } from '../../constants';
import { CourseMapper } from '../../types/course-mapper';

interface Props {
  onClose(): void;
  courseId: string;
  state?: CourseState | string;
}

export function CourseStateDialog({
  courseId,
  state,
  onClose,
}: Props) {
  const { t } = useTranslation('course');
  const { data: courseData, loading } = useCourseGetById(courseId);
  const { mutation: updateCourseMutation } = useCourseUpdate();
  const queryClient = useQueryClient();
  const courseMapper = new CourseMapper();

  const updateStateCourse = useCallback(
    (values: ICourseFormData) => {
      if (!values.id) {
        toast.error('Id của khóa học không tồn tại.', {
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

      // Merge with existing course data to preserve other fields
      let updateData: ICourseFormData;

      if (courseData) {
        // Convert entity to form data and update only the state
        updateData = courseMapper.toFormData(courseData);
        // Explicitly set state from form values
        updateData.state = values.state;
      } else {
        // Fallback: if course data is not loaded, we still need to send required fields
        // This should not happen in normal flow, but handle it gracefully
        toast.error('Không thể tải dữ liệu khóa học.', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }

      // Log for debugging
      console.log('Updating course state:', {
        courseId: updateData.id,
        state: updateData.state,
        stateType: typeof updateData.state,
      });

      updateCourseMutation.mutate(updateData, {
        onSuccess() {
          // Invalidate courses list to refresh the table
          queryClient.invalidateQueries([REACT_QUERY_KEYS.COURSES]);
          queryClient.invalidateQueries([REACT_QUERY_KEYS.GET_COURSE_BY_ID]);
          toast.success('Cập nhật trạng thái khóa học thành công', {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          onClose();
        },
        onError(error) {
          toast.error('Cập nhật trạng thái khóa học thất bại', {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: true,
          });
          console.error('Lỗi khi gọi API:', error);
        },
      });
    },
    [updateCourseMutation, onClose, queryClient, courseData, courseMapper],
  );

  return (
    <Modal
      open
      onClose={onClose}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '5rem',
      }}
    >
      <section className="w-full max-w-xl bg-white rounded shadow mx-4">
        <header className="flex items-center gap-4 p-6 pb-0">
          <h2 className="flex-auto font-semibold text-title">
            Chỉnh sửa trạng thái khóa học
          </h2>
        </header>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Đang tải...</p>
            </div>
          ) : (
            <CourseStateForm
              courseId={courseId}
              state={state}
              onClose={onClose}
              onSubmit={updateStateCourse}
            />
          )}
        </div>
      </section>
    </Modal>
  );
}

export default CourseStateDialog;

