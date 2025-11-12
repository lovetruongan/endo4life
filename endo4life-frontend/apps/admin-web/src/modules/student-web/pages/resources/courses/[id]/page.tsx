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
import { useState, useEffect, useMemo } from 'react';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { stringToRichText } from '@endo4life/util-common';
import { 
  MdCheckCircle, 
  MdSchool, 
  MdPeople, 
  MdWarning,
  MdLibraryBooks,
  MdEdit,
  MdEmojiEvents,
  MdPlayArrow,
  MdVideocam,
  MdStar
} from 'react-icons/md';

// Helper function to validate if a URL is a valid image URL
const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  // Check if it's JSON (starts with { or [)
  if (url.trim().startsWith('{') || url.trim().startsWith('[')) return false;
  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url);
    // Check for common image extensions or data URLs
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const pathname = urlObj.pathname.toLowerCase();
    const isImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
    const isDataUrl = url.startsWith('data:image/');
    return isImageExtension || isDataUrl || url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Helper function to parse JSON description and extract readable content
const parseDescription = (description: string | undefined): { text: string; isRichText: boolean; richTextContent?: any } => {
  if (!description || typeof description !== 'string') return { text: '', isRichText: false };
  
  // Check if it's JSON
  const trimmed = description.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(description);
      // Check for rich text editor format (Lexical)
      if (parsed.root?.children) {
        // This is a rich text format, return it for RichTextContent
        return { text: '', isRichText: true, richTextContent: { content: description } };
      }
      // Check for metadata structure
      if (parsed.metadata) {
        const meta = parsed.metadata;
        if (meta.mainContent) {
          const mainResult = parseDescription(meta.mainContent);
          if (mainResult.isRichText) return mainResult;
          if (mainResult.text) return mainResult;
        }
        if (meta.content) {
          const contentResult = parseDescription(meta.content);
          if (contentResult.isRichText) return contentResult;
          if (contentResult.text) return contentResult;
        }
        if (meta.description) {
          return parseDescription(meta.description);
        }
      }
      // Try to find any text field
      if (parsed.content) {
        const contentResult = parseDescription(parsed.content);
        if (contentResult.isRichText) return contentResult;
        if (contentResult.text) return contentResult;
      }
      if (parsed.text) return parseDescription(parsed.text);
      if (parsed.description) return parseDescription(parsed.description);
    } catch (e) {
      // If parsing fails, return empty
      return { text: '', isRichText: false };
    }
  }
  
  return { text: description, isRichText: false };
};

export function ResourceCoursePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

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

  // Error logging
  useEffect(() => {
    if (courseError) {
      console.error('Course detail error:', courseError);
    }
    if (lecturesError) {
      console.error('Lectures error:', lecturesError);
    }
  }, [courseError, lecturesError]);

  // Parse description for display
  const descriptionContent = useMemo(() => {
    return parseDescription(course?.description);
  }, [course?.description]);

  // Get valid thumbnail URL
  const thumbnailUrl = useMemo(() => {
    if (!course?.thumbnailUrl) return null;
    return isValidImageUrl(course.thumbnailUrl) ? course.thumbnailUrl : null;
  }, [course?.thumbnailUrl]);

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
      {/* Course Header - Thumbnail and Basic Info Side by Side */}
      <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-lg shadow-sm p-6">
        {/* Thumbnail - Left Side */}
        {thumbnailUrl && (
          <div className="flex-shrink-0">
            <div className="w-full lg:w-80 aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-md">
              <img
                src={thumbnailUrl}
                alt={course.title || 'Course thumbnail'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Course Basic Info - Right Side */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">{course.title}</h1>
            
            {course.lecturer && (
              <p className="text-base text-gray-600">
                <span className="font-semibold">Instructor:</span>{' '}
                <span className="font-medium">{course.lecturer}</span>
              </p>
            )}
          </div>

          {/* Enrollment Status and Info */}
          <div className="flex flex-wrap items-center gap-3">
            {isEnrolled && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <MdCheckCircle size={16} /> Enrolled
              </span>
            )}
            
            {isEnrolled && hasCompletedEntranceTest && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <MdCheckCircle size={16} /> Entrance Test Completed
              </span>
            )}

            {isEnrolled && progressStatus?.isCompletedCourse && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                <MdSchool size={16} /> Course Completed
              </span>
            )}

            {course.participantsCount !== undefined && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
                <MdPeople size={16} /> {course.participantsCount} students
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-2">
            {!isEnrolled ? (
              <Button
                onClick={handleEnroll}
                disabled={enrolling}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                {enrolling ? (
                  'Enrolling...'
                ) : (
                  <>
                    <MdLibraryBooks size={18} />
                    Enroll Now
                  </>
                )}
              </Button>
            ) : (
              <>
                {!hasCompletedEntranceTest ? (
                  <Button
                    onClick={() => {
                      const entranceTestRoute = STUDENT_WEB_ROUTES.COURSE_ENTRANCE_TEST.replace(':courseId', id);
                      navigate(entranceTestRoute);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg"
                  >
                    <MdEdit size={18} />
                    Take Entrance Test
                  </Button>
                ) : progressStatus?.isCompletedTotalCourseSection && !progressStatus?.isCompletedFinalCourseTest ? (
                  <Button
                    onClick={() => {
                      const finalExamRoute = STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', id);
                      navigate(finalExamRoute);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                  >
                    <MdEmojiEvents size={18} />
                    Take Final Exam
                  </Button>
                ) : progressStatus?.isCompletedCourse ? (
                  <Button
                    onClick={() => {
                      const finalExamRoute = STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM.replace(':courseId', id);
                      navigate(finalExamRoute);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                  >
                    <MdSchool size={18} />
                    View Certificate
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      // Navigate to first incomplete lecture
                      const firstIncompleteLecture = lectures?.find(l => !l.isCompletedCourseSection);
                      if (firstIncompleteLecture && firstIncompleteLecture.courseSectionId) {
                        const lectureRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
                          .replace(':courseId', id)
                          .replace(':lectureId', firstIncompleteLecture.courseSectionId);
                        navigate(lectureRoute);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    <MdPlayArrow size={18} />
                    Continue Learning
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Entrance Test Requirement Notice */}
          {isEnrolled && !hasCompletedEntranceTest && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MdWarning className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800">
                    Entrance Test Required
                  </h3>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Complete the entrance test to access course content.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Description/Content - Full Width Below */}
      {(descriptionContent.isRichText || descriptionContent.text) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">About This Course</h2>
          
          {descriptionContent.isRichText && descriptionContent.richTextContent && (
            <div className="text-gray-700 leading-relaxed prose max-w-none">
              <RichTextContent value={stringToRichText(descriptionContent.richTextContent.content)} />
            </div>
          )}

          {!descriptionContent.isRichText && descriptionContent.text && (
            <div className="text-gray-700 leading-relaxed">
              {descriptionContent.text}
            </div>
          )}
        </div>
      )}

      {/* Course Lectures - Full Width */}
      {isEnrolled && hasCompletedEntranceTest && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Course Content</h2>
            {lectures && lectures.length > 0 && (
              <span className="text-sm text-gray-600">
                {lectures.filter(l => l.isCompletedCourseSection).length} / {lectures.length} completed
              </span>
            )}
          </div>

          {lecturesLoading ? (
            <div className="text-center py-8 text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading lectures...
            </div>
          ) : lectures && lectures.length > 0 ? (
            <div className="flex flex-col gap-2">
              {lectures.map((lecture, index) => (
                <div
                  key={lecture.id}
                  onClick={() => {
                    if (lecture.courseSectionId) {
                      const lectureRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
                        .replace(':courseId', id)
                        .replace(':lectureId', lecture.courseSectionId);
                      navigate(lectureRoute);
                    }
                  }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {index + 1}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {lecture.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {lecture.videoDuration && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MdVideocam size={14} /> {Math.floor(lecture.videoDuration / 60)} min
                          </span>
                        )}
                        {lecture.totalCredits && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MdStar size={14} /> {lecture.totalCredits} credits
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {lecture.isCompletedCourseSection ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                        <MdCheckCircle size={16} />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-400"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No lectures available yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResourceCoursePage;
