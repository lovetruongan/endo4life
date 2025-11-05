import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@endo4life/feature-auth';
import { useCourseLectures, useLectureProgressRecord } from '@endo4life/feature-resources';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { stringToRichText } from '@endo4life/util-common';

export function LecturePlayerPage() {
  const { courseId = '', lectureId = '' } = useParams<{ courseId: string; lectureId: string }>();
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

  const { data: lectures, loading, error, refetch } = useCourseLectures(courseId, userInfoId, true);
  const { mutation: progressMutation } = useLectureProgressRecord();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastRecordedTime, setLastRecordedTime] = useState(0);
  const saveInFlightRef = useRef(false);

  const currentLecture = lectures?.find((l) => l.courseSectionId === lectureId);
  const currentIndex = lectures?.findIndex((l) => l.courseSectionId === lectureId) || 0;
  const nextLecture = lectures && currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;
  const prevLecture = lectures && currentIndex > 0 ? lectures[currentIndex - 1] : null;

  const isVideoComplete = currentLecture?.isCompletedVideoCourseSection ?? false;
  const hasReviewQuestions = (currentLecture?.totalQuestionLectureReviewTest ?? 0) > 0;
  const hasCompletedReview = currentLecture?.isCompletedLectureReviewQuestion ?? false;

  // Calculate if video is 80%+ complete
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isVideoWatchedEnough = progressPercentage >= 80;

  // Record progress every 10 seconds
  useEffect(() => {
    if (!currentLecture || !currentTime) return;

    const timeSinceLastRecord = currentTime - lastRecordedTime;
    if (timeSinceLastRecord < 10) return;
    if (saveInFlightRef.current) return;

    saveInFlightRef.current = true;
    progressMutation.mutate(
      {
        progressId: currentLecture.id,
        watchTime: Math.floor(currentTime),
      },
      {
        onSuccess: () => {
          setLastRecordedTime(currentTime);
          saveInFlightRef.current = false;
          console.log(`Progress recorded: ${Math.floor(currentTime)}s`);
        },
        onError: (error) => {
          saveInFlightRef.current = false;
          console.error('Failed to record progress:', error);
        },
      }
    );
  }, [currentTime, lastRecordedTime, currentLecture?.id]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnd = () => {
    // Record final progress when video ends
    if (!currentLecture) return;
    saveInFlightRef.current = true;
    progressMutation.mutate(
      {
        progressId: currentLecture.id,
        watchTime: Math.floor(duration || currentTime),
      },
      {
        onSuccess: () => {
          setLastRecordedTime(duration || currentTime);
          saveInFlightRef.current = false;
          refetch();
        },
        onError: () => {
          saveInFlightRef.current = false;
        },
      }
    );
  };

  const handleBackToCourse = () => {
    const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', courseId);
    navigate(courseRoute);
  };

  const handleGoToReview = () => {
    const reviewRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE_REVIEW
      .replace(':courseId', courseId)
      .replace(':lectureId', lectureId);
    navigate(reviewRoute);
  };

  const handleNextLecture = () => {
    if (nextLecture) {
      const nextRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
        .replace(':courseId', courseId)
        .replace(':lectureId', nextLecture.courseSectionId);
      navigate(nextRoute);
    }
  };

  const handlePrevLecture = () => {
    if (prevLecture) {
      const prevRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE
        .replace(':courseId', courseId)
        .replace(':lectureId', prevLecture.courseSectionId);
      navigate(prevRoute);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (error || !currentLecture) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lecture Not Found</h2>
          <p className="text-gray-600 mb-6">
            The lecture you're looking for could not be found or you don't have access to it.
          </p>
          <button
            onClick={handleBackToCourse}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCourse}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <MdArrowBack size={20} />
              Back to Course
            </button>
            <div className="flex items-center gap-4">
              {isVideoComplete && (
                <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <MdCheckCircle size={16} />
                  Video Completed
                </span>
              )}
              {hasCompletedReview && (
                <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <MdCheckCircle size={16} />
                  Review Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Video */}
              <div className="relative bg-black aspect-video">
                {currentLecture.attachmentUrl ? (
                  <video
                    ref={videoRef}
                    src={currentLecture.attachmentUrl}
                    controls
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnd}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <p className="text-lg">No video available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Watch Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {!isVideoComplete && isVideoWatchedEnough && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ You've watched enough to proceed!
                  </p>
                )}
              </div>

              {/* Lecture Info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLecture.title}
                </h1>
                {currentLecture.attribute && (
                  <div className="text-gray-700 prose max-w-none space-y-4">
                    {(() => {
                      try {
                        const raw = (currentLecture as any).attribute;
                        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        const meta = obj?.metadata ?? obj;
                        const main = meta?.mainContent ?? meta?.content ?? meta?.description;
                        const target = meta?.target ?? meta?.objective;
                        return (
                          <>
                            {main && (
                              <RichTextContent value={stringToRichText(main)} />
                            )}
                            {target && (
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Objectives</h3>
                                <RichTextContent value={stringToRichText(target)} />
                              </div>
                            )}
                          </>
                        );
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  {currentLecture.videoDuration && (
                    <span>Duration: {Math.floor(currentLecture.videoDuration / 60)} min</span>
                  )}
                  {currentLecture.totalCredits && (
                    <span>Credits: {currentLecture.totalCredits}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              {hasReviewQuestions && isVideoWatchedEnough && (
                <button
                  onClick={handleGoToReview}
                  className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  {hasCompletedReview ? 'Review Questions Again' : 'Take Review Questions'}
                  <MdArrowForward size={20} />
                </button>
              )}

              {(!hasReviewQuestions || hasCompletedReview) && nextLecture && (
                <button
                  onClick={handleNextLecture}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  Next Lecture: {nextLecture.title}
                  <MdArrowForward size={20} />
                </button>
              )}

              {hasReviewQuestions && !isVideoWatchedEnough && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Watch at least 80% of the video to unlock the review questions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Lecture List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {lectures?.map((lecture, index) => (
                  <div
                    key={lecture.id}
                    onClick={() => {
                      if (lecture.courseSectionId !== lectureId) {
                        const route = STUDENT_WEB_ROUTES.COURSE_LECTURE
                          .replace(':courseId', courseId)
                          .replace(':lectureId', lecture.courseSectionId);
                        navigate(route);
                      }
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      lecture.courseSectionId === lectureId
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 text-gray-500 font-medium">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {lecture.title}
                        </h3>
                        {lecture.videoDuration && (
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.floor(lecture.videoDuration / 60)} min
                          </p>
                        )}
                      </div>
                      {lecture.isCompletedCourseSection && (
                        <MdCheckCircle className="flex-shrink-0 text-green-600" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={handlePrevLecture}
                  disabled={!prevLecture}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MdArrowBack size={16} />
                  Previous
                </button>
                <button
                  onClick={handleNextLecture}
                  disabled={!nextLecture}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next
                  <MdArrowForward size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturePlayerPage;

