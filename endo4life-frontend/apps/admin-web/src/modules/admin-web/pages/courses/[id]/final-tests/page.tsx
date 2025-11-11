import {
  CourseTest,
  CourseTestTypeEnum,
} from '@endo4life/feature-course';
import { useParams } from 'react-router-dom';

export function CourseFinalTestsPage() {
  const { id: courseId } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col h-full min-h-0 p-2 overflow-hidden bg-white border rounded-lg border-slate-100">
      {courseId && (
        <CourseTest
          courseId={courseId}
          type={CourseTestTypeEnum.FINAL_EXAM_COURSE}
        />
      )}
    </div>
  );
}
