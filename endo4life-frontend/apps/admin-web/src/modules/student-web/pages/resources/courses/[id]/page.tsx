import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@endo4life/feature-auth';
import {
  useUserCourseDetail,
  useCourseEnrollment,
  useCourseLectures,
  useCourseProgressStatus,
} from '@endo4life/feature-resources';
import { Button } from '@endo4life/ui-common';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';

export function ResourceCoursePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

  console.log('Current user profile:', userProfile);

  const {
    data: course,
    loading: courseLoading,
    error: courseError,
  } = useUserCourseDetail(id, userInfoId);

  const isEnrolled = course?.isEnrolledCourse ?? false;

  const {
    data: progressStatus,
    loading: progressLoading,
  } = useCourseProgressStatus(userInfoId, id, isEnrolled);

  const {
    data: lectures,
    loading: lecturesLoading,
    error: lecturesError,
  } = useCourseLectures(id, userInfoId, isEnrolled);

  const { mutation: enrollMutation } = useCourseEnrollment();

  const [enrolling, setEnrolling] = useState(false);

  const hasCompletedEntranceTest = progressStatus?.isCompletedEntranceTest ?? false;

  // Debug logging
  useEffect(() => {
    if (courseError) {
      console.error('Course detail error:', courseError);
    }
    if (lecturesError) {
      console.error('Lectures error:', lecturesError);
    }
  }, [courseError, lecturesError]);

  useEffect(() => {
    if (lectures) {
      console.log('Lectures data:', lectures);
    }
  }, [lectures]);

  const handleEnroll = async () => {
    if (!userInfoId) {
      toast.error('Please login to enroll in this course', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setEnrolling(true);
    enrollMutation.mutate(
      { courseId: id, userInfoId },
      {
        onSuccess: () => {
          toast.success('Successfully enrolled in course!', {
            position: 'top-right',
            autoClose: 3000,
          });
          setEnrolling(false);
        },
        onError: (error: unknown) => {
          console.error('Enrollment error details:', error);

          // Extract error message from axios error
          let errorMessage = 'Failed to enroll in course';
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
              response?: { data?: { message?: string } };
            };
            const backendMessage = axiosError.response?.data?.message;

            // Handle specific backend errors
            if (backendMessage?.includes('UserInfo not found')) {
              errorMessage =
                'Please complete your profile before enrolling. Go to "My Profile" to set up your account.';
            } else {
              errorMessage = backendMessage || errorMessage;
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 5000,
          });
          setEnrolling(false);
        },
      },
    );
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Course not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-8 p-6">
      {/* Course Header */}
      <div className="flex flex-col gap-6">
        {/* Thumbnail */}
        {course.thumbnailUrl && (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Course Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold">{course.title}</h1>

          {course.lecturer && (
            <p className="text-lg text-gray-600">
              Instructor: <span className="font-medium">{course.lecturer}</span>
            </p>
          )}

          {course.description && (
            <p className="text-gray-700 leading-relaxed">
              {course.description}
            </p>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Enrollment Info */}
          <div className="flex items-center gap-4">
            {course.participantsCount !== undefined && (
              <span className="text-gray-600">
                {course.participantsCount} students enrolled
              </span>
            )}
          </div>

          {/* Enrollment Button */}
          <div className="flex gap-4 mt-4">
            {!isEnrolled ? (
              <Button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                  ✓ Enrolled
                </span>
                {!hasCompletedEntranceTest ? (
                  <Button
                    onClick={() => {
                      const entranceTestRoute = STUDENT_WEB_ROUTES.COURSE_ENTRANCE_TEST.replace(':courseId', id);
                      navigate(entranceTestRoute);
                    }}
                    className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg"
                  >
                    Take Entrance Test
                  </Button>
                ) : progressStatus?.isCompletedTotalCourseSection && !progressStatus?.isCompletedFinalCourseTest ? (
                  <Button
                    onClick={() => {
                      const finalExamRoute = STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', id);
                      navigate(finalExamRoute);
                    }}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2"
                  >
                    🎯 Take Final Exam
                  </Button>
                ) : progressStatus?.isCompletedCourse ? (
                  <Button
                    onClick={() => {
                      const finalExamRoute = STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', id);
                      navigate(finalExamRoute);
                    }}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2"
                  >
                    🎓 View Certificate
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      // Navigate to first incomplete lecture
                      const firstIncompleteLecture = lectures?.find(l => !l.isCompletedCourseSection);
                      if (firstIncompleteLecture) {
                        const lectureRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
                          .replace(':courseId', id)
                          .replace(':lectureId', firstIncompleteLecture.courseSectionId);
                        navigate(lectureRoute);
                      }
                    }}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Continue Learning
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Entrance Test Requirement Notice */}
          {isEnrolled && !hasCompletedEntranceTest && (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-yellow-700 text-xl">⚠️</span>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800">
                    Entrance Test Required
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You must complete the entrance test before accessing the course lectures.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Lectures */}
      {isEnrolled && hasCompletedEntranceTest && (
        <div className="flex flex-col gap-4 mt-8">
          <h2 className="text-2xl font-bold">Course Content</h2>

          {lecturesLoading ? (
            <div className="text-gray-600">Loading lectures...</div>
          ) : lectures && lectures.length > 0 ? (
            <div className="flex flex-col gap-3">
              {lectures.map((lecture, index) => (
                <div
                  key={lecture.id}
                  onClick={() => {
                    const lectureRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
                      .replace(':courseId', id)
                      .replace(':lectureId', lecture.courseSectionId);
                    navigate(lectureRoute);
                  }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors hover:border-blue-500"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 font-medium">
                      {index + 1}.
                    </span>
                    <div className="flex flex-col">
                      <h3 className="font-medium">{lecture.title}</h3>
                      {lecture.videoDuration && (
                        <span className="text-sm text-gray-500">
                          {Math.floor(lecture.videoDuration / 60)} minutes
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {lecture.isCompletedCourseSection && (
                      <span className="text-green-600 font-medium">✓</span>
                    )}
                    {lecture.totalCredits && (
                      <span className="text-sm text-gray-500">
                        {lecture.totalCredits} credits
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">No lectures available yet</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResourceCoursePage;
