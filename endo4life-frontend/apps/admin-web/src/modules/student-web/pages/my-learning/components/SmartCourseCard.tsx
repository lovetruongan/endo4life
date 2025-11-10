import { useCourseProgressStatus, useCourseLectures } from '@endo4life/feature-resources';
import { useNavigate } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { MdPlayArrow, MdCheckCircle, MdSchool, MdGpsFixed, MdMenuBook } from 'react-icons/md';

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
        label: 'Xem chứng chỉ',
        route: STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', course.courseId),
        color: 'bg-green-600 hover:bg-green-700',
        icon: MdSchool,
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
        label: 'Làm bài thi cuối khóa',
        route: STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', course.courseId),
        color: 'bg-purple-600 hover:bg-purple-700',
        icon: MdGpsFixed,
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

  // Helper function to get thumbnail URL with fallback
  const getThumbnailUrl = (): string => {
    if (course.thumbnailUrl) {
      return course.thumbnailUrl;
    }
    // Return a nice placeholder SVG with icon
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%233b82f6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%239333ea;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="225" fill="url(%23grad)"/%3E%3Cpath d="M160,80 L160,130 L240,130 L240,80 L220,80 L220,70 L180,70 L180,80 Z M170,90 L170,120 L230,120 L230,90 Z M185,100 L215,100 M185,110 L215,110" stroke="white" stroke-width="3" fill="none" opacity="0.8"/%3E%3C/svg%3E';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Thumbnail */}
      <div
        className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 cursor-pointer relative group overflow-hidden"
        onClick={() => {
          const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.courseId);
          navigate(courseRoute);
        }}
      >
        <img
          src={getThumbnailUrl()}
          alt={course.courseTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.startsWith('data:image/svg')) {
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%233b82f6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%239333ea;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="225" fill="url(%23grad)"/%3E%3Cpath d="M160,80 L160,130 L240,130 L240,80 L220,80 L220,70 L180,70 L180,80 Z M170,90 L170,120 L230,120 L230,90 Z M185,100 L215,100 M185,110 L215,110" stroke="white" stroke-width="3" fill="none" opacity="0.8"/%3E%3C/svg%3E';
            }
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
            <div className="flex flex-col items-center gap-2">
              <MdPlayArrow size={40} />
              <span className="text-sm font-medium">Xem khóa học</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors min-h-[3.5rem]"
          onClick={() => {
            const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.courseId);
            navigate(courseRoute);
          }}
        >
          {course.courseTitle}
        </h3>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 font-medium">Tiến độ học tập</span>
            <span className="text-sm font-bold text-blue-600">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                progressPercentage === 100
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <span className="font-medium text-gray-900">{course.numberLecturesCompleted}</span> / {course.totalLectures} bài học
          </span>
          {progressStatus?.isCompletedCourse && (
            <span className="flex items-center gap-1 text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
              <MdCheckCircle size={16} />
              Hoàn thành
            </span>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(nextAction.route);
          }}
          className={`w-full px-4 py-2.5 ${nextAction.color} text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
        >
          {nextAction.icon ? <nextAction.icon size={20} /> : !progressStatus?.isCompletedCourse && <MdPlayArrow size={20} />}
          {nextAction.label}
        </button>
      </div>
    </div>
  );
}