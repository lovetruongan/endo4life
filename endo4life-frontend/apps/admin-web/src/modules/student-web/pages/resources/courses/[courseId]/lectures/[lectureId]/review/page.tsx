import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@endo4life/feature-auth';
import {
  useLectureReviewTest,
  useTestSubmission,
  useCourseLectures,
} from '@endo4life/feature-resources';
import { StudentTestContainer } from '@endo4life/feature-resources';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { toast } from 'react-toastify';

export function LectureReviewPage() {
  const { courseId = '', lectureId = '' } = useParams<{ courseId: string; lectureId: string }>();
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

  // Get lectures to check video completion status
  const { data: lectures } = useCourseLectures(courseId, userInfoId, true);
  const currentLecture = lectures?.find((l) => l.courseSectionId === lectureId);

  const {
    data: test,
    loading,
    error,
  } = useLectureReviewTest(lectureId, userInfoId);

  const { mutation: submitMutation } = useTestSubmission();

  // Check if video is completed (80%+ watched)
  const isVideoComplete = currentLecture?.isCompletedVideoCourseSection ?? false;

  // If video not complete, redirect back to lecture player
  if (!loading && !isVideoComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Video Not Complete
          </h2>
          <p className="text-gray-600 mb-6">
            You must watch at least 80% of the lecture video before taking the review questions.
          </p>
          <button
            onClick={() => {
              const lectureRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
                .replace(':courseId', courseId)
                .replace(':lectureId', lectureId);
              navigate(lectureRoute);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Back to Lecture
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (answers: any[]) => {
    try {
      const result = await submitMutation.mutateAsync({
        testId: test!.id,
        submission: {
          userInfoId,
          answers,
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to submit review questions:', error);
      toast.error('Failed to submit review questions. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
      throw error;
    }
  };

  const handleTestComplete = (result: any) => {
    if (result.passed) {
      toast.success('Great job! You passed the review questions!', {
        position: 'top-right',
        autoClose: 5000,
      });

      // Find next lecture
      const currentIndex = lectures?.findIndex((l) => l.courseSectionId === lectureId) || 0;
      const nextLecture = lectures && currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;

      // If there's a next lecture, user can proceed
      if (nextLecture) {
        // User will see "Continue" button in the result modal
      }
    } else {
      toast.error('You did not pass the review questions. Please review the lecture and try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleClose = () => {
    const lectureRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
      .replace(':courseId', courseId)
      .replace(':lectureId', lectureId);
    navigate(lectureRoute);
  };

  const handleContinue = () => {
    // Find next lecture
    const currentIndex = lectures?.findIndex((l) => l.courseSectionId === lectureId) || 0;
    const nextLecture = lectures && currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;

    if (nextLecture) {
      const nextRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
        .replace(':courseId', courseId)
        .replace(':lectureId', nextLecture.courseSectionId);
      navigate(nextRoute);
    } else {
      // No more lectures, go back to course detail
      const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', courseId);
      navigate(courseRoute);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review questions...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Review Questions
          </h2>
          <p className="text-gray-600 mb-6">
            {error
              ? 'There was an error loading the review questions. Please try again later.'
              : 'The review questions are not available for this lecture.'}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Back to Lecture
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <span className="text-yellow-700 text-xl">📝</span>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Lecture Review Questions
            </p>
            <p className="text-xs text-yellow-700">
              You must pass these questions to proceed to the next lecture
            </p>
          </div>
        </div>
      </div>

      <StudentTestContainer
        test={test}
        userInfoId={userInfoId}
        onSubmit={handleSubmit}
        onClose={handleClose}
        onTestComplete={(result) => {
          handleTestComplete(result);
          // Provide custom continue handler to navigate to next lecture
          if (result.passed) {
            setTimeout(() => {
              handleContinue();
            }, 3000); // Auto-navigate after 3 seconds
          }
        }}
        showAllQuestions={false}
      />
    </div>
  );
}

export default LectureReviewPage;

