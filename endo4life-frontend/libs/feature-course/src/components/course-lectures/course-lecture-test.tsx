import { IconButton, Modal } from '@mui/material';
import { CourseTest } from '../course-test/course-test';
import { CourseTestTypeEnum } from '../../types';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { useMount } from 'ahooks';
import { selectCourseLectureById } from '../../store/course-lectures/course-lectures.selectors';
import { Button } from '@endo4life/ui-common';
import { loadCourseLectureDetailAsync } from '../../store/course-lectures/thunks/load-course-lecture-detail.thunk';
import { selectCourseTestByLectureId } from '../../store/course-tests/course-tests.selectors';
import { VscClose } from 'react-icons/vsc';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  open?: boolean;
  onClose?(): void;
  courseId: string;
  lectureId: string;
}
export function CourseLectureTestModal({
  open,
  onClose,
  courseId,
  lectureId,
}: Props) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const lecture = useAppSelector(selectCourseLectureById(lectureId));
  const test = useAppSelector(selectCourseTestByLectureId(lectureId));
  const navigate = useNavigate();

  useMount(async () => {
    try {
      await dispatch(loadCourseLectureDetailAsync({ lectureId, courseId }));
    } catch (error) {
      console.log('failed to load course detail');
    } finally {
      setLoading(false);
    }
  });

  return (
    <Modal
      open={!!open}
      onClose={onClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded shadow w-full max-w-4xl h-4/5 relative flex flex-col">
        <div className="flex items-center gap-2 p-4">
          <h3 className="text-lg font-semibold flex-auto">{lecture?.title}</h3>
          <Link
            className="flex-none px-3 py-1 text-sm bg-white border rounded-lg border-slate-300"
            to={ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES_RECAP_QUESTION
              .replace(':id', courseId)
              .replace(':lectureId', lectureId)}
          >
            Mở toàn trang
          </Link>
          <IconButton onClick={onClose} className="flex-none">
            <VscClose size={18} />
          </IconButton>
        </div>
        {!loading && test && (
          <CourseTest
            courseId={courseId}
            type={CourseTestTypeEnum.LECTURE_REVIEW_QUESTIONS_COURSE}
            testId={test.id}
          />
        )}

        {loading && <div className="p-4 text-center">Đang tải dữ liệu...</div>}
      </div>
    </Modal>
  );
}
