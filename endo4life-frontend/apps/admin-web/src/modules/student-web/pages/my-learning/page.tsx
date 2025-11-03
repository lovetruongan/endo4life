import { useAuthContext } from '@endo4life/feature-auth';
import { useCourseProgress } from '@endo4life/feature-resources';
import { useNavigate } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';

export function MyLearningPage() {
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

  const { data: courses, loading, error } = useCourseProgress(userInfoId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Failed to load your courses</p>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Enrolled Courses Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start your learning journey by enrolling in a course from our library
          </p>
          <button
            onClick={() => navigate(STUDENT_WEB_ROUTES.RESOURCES)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
        <p className="text-gray-600">
          Track your progress and continue learning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const progressPercentage =
            course.totalLectures > 0
              ? Math.round((course.numberLecturesCompleted / course.totalLectures) * 100)
              : 0;

          return (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', course.courseId);
                navigate(courseRoute);
              }}
            >
              {/* Thumbnail */}
              {course.thumbnailUrl && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.courseTitle}
                </h3>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
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
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    {course.numberLecturesCompleted} / {course.totalLectures} lectures
                  </span>
                  {progressPercentage === 100 && (
                    <span className="text-green-600 font-medium">✓ Completed</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyLearningPage;
