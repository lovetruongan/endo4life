import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import {
  CourseForm,
  CourseMapper,
  ICourseFormData,
  useCourseContext,
  useCourseCreate,
  useCourseUpdate,
} from '@endo4life/feature-course';
import { isLocalUuid } from '@endo4life/util-common';
import { useNavigate, useParams } from 'react-router-dom';

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const { id: courseId = '' } = useParams<{ id: string }>();
  const { loading, data } = useCourseContext();
  const { mutation: createMutation } = useCourseCreate();
  const { mutation: updateMutation } = useCourseUpdate();
  const isCreateNew = isLocalUuid(courseId);

  const handleClose = () => {
    navigate(ADMIN_WEB_ROUTES.COURSES);
  };
  const handleSubmit = (data: ICourseFormData) => {
    if (isCreateNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Đang tải dữ liệu</div>;
  }

  return (
    <div className="h-full pb-24 overflow-y-auto bg-white rounded-b-lg">
      <CourseForm
        data={data ? new CourseMapper().toFormData(data) : undefined}
        loading={createMutation.isLoading || updateMutation.isLoading}
        onClose={handleClose}
        onSubmit={handleSubmit}
        txtSubmit={isCreateNew ? 'Tạo mới' : 'Lưu'}
      />
    </div>
  );
}
