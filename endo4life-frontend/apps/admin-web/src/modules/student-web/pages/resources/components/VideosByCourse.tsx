import { useCourses, useCourseLectures } from '@endo4life/feature-resources';
import { useAuthContext } from '@endo4life/feature-auth';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { Link } from 'react-router-dom';
import { PiPlayFill } from 'react-icons/pi';
import { MdArrowForward } from 'react-icons/md';
import moment from 'moment';
import { Fragment } from 'react';

interface VideosByCourseProps {
  filter: any;
  loading?: boolean;
}

interface CourseVideosProps {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
}

function CourseVideos({ courseId, courseTitle, courseThumbnail }: CourseVideosProps) {
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  
  // Try to get lectures (may fail if not enrolled, that's OK)
  const { data: lectures, loading: lecturesLoading, error } = useCourseLectures(
    courseId,
    userInfoId, // Use actual userInfoId (empty string if not logged in)
    !!userInfoId // Only enable query if user is logged in
  );

  // Filter only lectures with videos (attachmentUrl)
  // Note: videoDuration may be null, so we only check for attachmentUrl
  const videoLectures = lectures?.filter(
    (lecture) => lecture.attachmentUrl && lecture.attachmentUrl.trim() !== ''
  ) || [];

  if (lecturesLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-48 aspect-video bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Show message if not logged in
  if (!userInfoId) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Vui lòng <span className="text-primary-600 font-medium">đăng nhập</span> để xem video trong khóa học này
      </div>
    );
  }

  // Show error if there's an API error
  if (error) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Không thể tải video. Vui lòng enroll vào khóa học để xem video
      </div>
    );
  }

  if (videoLectures.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        Khóa học này chưa có video
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Horizontal Scroll Container */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {videoLectures.map((lecture) => {
          const lectureRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
            .replace(':courseId', courseId)
            .replace(':lectureId', lecture.courseSectionId || '');

          // Format video duration (may be null in database)
          const duration = lecture.videoDuration && lecture.videoDuration > 0
            ? moment.utc(lecture.videoDuration * 1000).format('mm:ss')
            : null;

          return (
            <Link
              key={lecture.courseSectionId || lecture.id}
              to={lectureRoute}
              className="group flex-shrink-0 w-48 relative"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {/* Use course thumbnail or video thumbnail if available */}
                <img
                  src={
                    courseThumbnail ||
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3EVideo%3C/text%3E%3C/svg%3E'
                  }
                  alt={lecture.title || courseTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.startsWith('data:image/svg')) {
                      target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3EVideo%3C/text%3E%3C/svg%3E';
                    }
                  }}
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-black bg-opacity-50 rounded-full group-hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100">
                    <PiPlayFill size={20} color="white" />
                  </div>
                </div>

                {/* Duration Badge */}
                {duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 text-xs text-white bg-black bg-opacity-70 rounded">
                    {duration}
                  </div>
                )}
              </div>

              {/* Video Title */}
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {lecture.title || 'Video không có tiêu đề'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Scroll Indicator (optional) */}
      {videoLectures.length > 3 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white to-transparent w-8 h-full pointer-events-none flex items-center">
          <MdArrowForward className="text-gray-400" size={20} />
        </div>
      )}
    </div>
  );
}

export function VideosByCourse({ filter, loading }: VideosByCourseProps) {
  // Create a course filter instead of using resource filter
  // We want to get all courses to show their videos
  const courseFilter = {
    page: 0,
    size: 100, // Get many courses to show videos
    sort: {
      field: 'createdAt',
      order: 'DESC' as const,
    },
  };

  const { data: courses, loading: coursesLoading } = useCourses(courseFilter);

  if (loading || coursesLoading) {
    return <LoadingSkeleton />;
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Chưa có khóa học nào</p>
        <p className="text-sm mt-2">Vui lòng thử lại sau</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Course Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
              <Link
                to={STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.id)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Xem khóa học
                <MdArrowForward size={18} />
              </Link>
            </div>
          </div>

          {/* Course Videos Preview */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Video trong khóa học
              </h3>
              <p className="text-sm text-gray-500">
                Click vào video để xem chi tiết hoặc vào khóa học để học đầy đủ
              </p>
            </div>

            {/* Videos Horizontal Scroll */}
            <CourseVideos
              courseId={course.id}
              courseTitle={course.title || ''}
              courseThumbnail={course.thumbnailUrl}
            />

            {/* View All Link */}
            <div className="mt-4 text-center">
              <Link
                to={STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.id)}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Xem tất cả video trong khóa học này
                <MdArrowForward size={18} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const LoadingSkeleton = () => (
  <Fragment>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
        <div className="flex gap-3 overflow-x-auto">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex-shrink-0 w-48 aspect-video bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ))}
  </Fragment>
);

// CSS for hiding scrollbar but keeping scroll functionality
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export default VideosByCourse;