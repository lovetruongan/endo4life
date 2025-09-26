import { IconButton, Modal } from '@mui/material';
import {
  CourseSectionForm,
  CourseSectionMapper,
  ICourseSectionFormData,
  useCourseSectionGetById,
} from '@endo4life/feature-course-section';
import { VscClose } from 'react-icons/vsc';

interface Props {
  open?: boolean;
  onClose?(): void;
  courseId: string;
  lectureId: string;
}
export function CourseLectureDetailModal({
  open,
  onClose,
  courseId,
  lectureId,
}: Props) {
  const { data, loading } = useCourseSectionGetById(lectureId);

  const handSubmit = async (data: ICourseSectionFormData) => {
    onClose && onClose();
  };

  return (
    <Modal
      open={!!open}
      onClose={onClose}
      className="flex items-center justify-center p-4"
    >
      <section className="bg-white rounded-lg shadow w-full max-w-4xl">
        <div className="flex items-center gap-2 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold flex-auto">{data?.title}</h3>
          <IconButton onClick={onClose} className="flex-none">
            <VscClose size={18} />
          </IconButton>
        </div>

        {!loading && data && (
          <CourseSectionForm
            id="course-section-form"
            data={new CourseSectionMapper().toFormData(data)}
            onSubmit={handSubmit}
            onClose={onClose}
          />
        )}
      </section>
    </Modal>
  );
}
