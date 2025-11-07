import { useCourseProgressStatus, useCourseLectures } from '@endo4life/feature-resources';
import { useNavigate } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { MdPlayArrow, MdCheckCircle } from 'react-icons/md';

interface SmartCourseCardProps {
  course: {
    id: string;
    courseId: string;
    courseTitle: string;
    thumbnailUrl?: string;
    numberLecturesCompleted: number;
    totalLectures: number;
  };
  userInfoId: string;
}

export function SmartCourseCard({ course, userInfoId }: SmartCourseCardProps) {
  const navigate = useNavigate();

  const { data: progressStatus } = useCourseProgressStatus(userInfoId, course.courseId, true);
  const { data: lectures } = useCourseLectures(course.courseId, userInfoId, true);

  const progressPercentage =
    course.totalLectures > 0
      ? Math.round((course.numberLecturesCompleted / course.totalLectures) * 100)
      : 0;

  // Determine the next step and button text
  const getNextAction = () => {
    const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.courseId);

    // If course is completed
    if (progressStatus?.isCompletedCourse) {
      return {
        label: '🎓 Xem chứng chỉ',
        route: STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', course.courseId),
        color: 'bg-green-600 hover:bg-green-700',
      };
    }

    // If entrance test not completed
    if (!progressStatus?.isCompletedEntranceTest) {
      return {
        label: 'Làm bài kiểm tra đầu vào',
        route: STUDENT_WEB_ROUTES.COURSE_ENTRANCE_TEST.replace(':courseId', course.courseId),
        color: 'bg-yellow-600 hover:bg-yellow-700',
      };
    }

    // If all lectures done but final exam not done
    if (progressStatus?.isCompletedTotalCourseSection && !progressStatus?.isCompletedFinalCourseTest) {
      return {
        label: '🎯 Làm bài thi cuối khóa',
        route: STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', course.courseId),
        color: 'bg-purple-600 hover:bg-purple-700',
      };
    }

    // Find next incomplete lecture
    const nextLecture = lectures?.find((l) => !l.isCompletedCourseSection);
    if (nextLecture) {
      // Check if the lecture has review questions that need to be completed
      if (nextLecture.isCompletedVideoCourseSection && !nextLecture.isCompletedLectureReviewQuestion) {
        return {
          label: 'Hoàn thành câu hỏi ôn tập',
          route: STUDENT_WEB_ROUTES.COURSE_LECTURE_REVIEW
            .replace(':courseId', course.courseId)
            .replace(':lectureId', nextLecture.courseSectionId),
          color: 'bg-blue-600 hover:bg-blue-700',
        };
      }

      // Continue with lecture video
      return {
        label: 'Tiếp tục bài học',
        route: STUDENT_WEB_ROUTES.COURSE_LECTURE
          .replace(':courseId', course.courseId)
          .replace(':lectureId', nextLecture.courseSectionId),
        color: 'bg-blue-600 hover:bg-blue-700',
      };
    }

    // Default: go to course detail
    return {
      label: 'Xem khóa học',
      route: courseRoute,
      color: 'bg-gray-600 hover:bg-gray-700',
    };
  };

  const nextAction = getNextAction();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      {course.thumbnailUrl && (
        <div
          className="aspect-video bg-gray-200 cursor-pointer relative group"
          onClick={() => {
            const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.courseId);
            navigate(courseRoute);
          }}
        >
          <img
            src={course.thumbnailUrl}
            alt={course.courseTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm">Xem khóa học</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
          onClick={() => {
            const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.courseId);
            navigate(courseRoute);
          }}
        >
          {course.courseTitle}
        </h3>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Tiến độ</span>
            <span className="text-sm font-medium text-gray-900">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
          <span>
            {course.numberLecturesCompleted} / {course.totalLectures} bài học
          </span>
          {progressStatus?.isCompletedCourse && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <MdCheckCircle size={16} />
              Đã hoàn thành
            </span>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(nextAction.route);
          }}
          className={`w-full px-4 py-2 ${nextAction.color} text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2`}
        >
          {!progressStatus?.isCompletedCourse && <MdPlayArrow size={20} />}
          {nextAction.label}
        </button>
      </div>
    </div>
  );
}