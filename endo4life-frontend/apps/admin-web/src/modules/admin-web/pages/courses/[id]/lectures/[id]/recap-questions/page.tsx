import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CourseTest,
  CourseTestTypeEnum,
  useAppDispatch,
  useAppSelector,
  loadCourseLectureDetailAsync,
  selectCourseTestByLectureId,
  addCourseTests,
  CourseTestBuilder,
  CourseTestTypeEnum as TestType,
} from '@endo4life/feature-course';

export function CourseLectureDetailRecapQuestionsPage() {
  const { id: courseId = '', lectureId = '' } = useParams<{
    id: string;
    lectureId: string;
  }>();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const test = useAppSelector(selectCourseTestByLectureId(lectureId));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (courseId && lectureId && !hasLoaded) {
          // Load lecture detail which includes the test
          await dispatch(loadCourseLectureDetailAsync({ courseId, lectureId }));
          setHasLoaded(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lectureId]);

  console.log('CourseLectureDetailRecapQuestionsPage', {
    courseId,
    lectureId,
    test,
    loading,
    hasLoaded,
  });

  if (!lectureId) {
    return (
      <div className="h-full p-4 bg-white rounded-lg border border-slate-100">
        <p className="text-gray-700">
          Chọn một bài giảng để tạo câu hỏi ôn tập.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 bg-white rounded-lg border border-slate-100">
      {!loading && test && (
        <CourseTest
          courseId={courseId}
          type={CourseTestTypeEnum.LECTURE_REVIEW_QUESTIONS_COURSE}
          testId={test.id}
        />
      )}
      {loading && <div className="p-4 text-center">Đang tải dữ liệu...</div>}
      {!loading && !test && (
        <div className="p-6 text-center text-gray-600">
          Chưa có bài kiểm tra ôn tập cho bài giảng này. Đang khởi tạo...
        </div>
      )}
    </div>
  );
}
