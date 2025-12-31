import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@endo4life/feature-auth';
import {
  useCourseLectures,
  useLectureProgressRecord,
} from '@endo4life/feature-resources';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdWarning,
  MdCheck,
} from 'react-icons/md';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { stringToRichText } from '@endo4life/util-common';

export function LecturePlayerPage() {
  const { courseId = '', lectureId = '' } = useParams<{
    courseId: string;
    lectureId: string;
  }>();
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

  const {
    data: lectures,
    loading,
    error,
    refetch,
  } = useCourseLectures(courseId, userInfoId, true);
  const { mutation: progressMutation } = useLectureProgressRecord();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastRecordedTime, setLastRecordedTime] = useState(0);
  const saveInFlightRef = useRef(false);

  const currentLecture = lectures?.find((l) => l.courseSectionId === lectureId);
  const currentIndex =
    lectures?.findIndex((l) => l.courseSectionId === lectureId) || 0;
  const nextLecture =
    lectures && currentIndex < lectures.length - 1
      ? lectures[currentIndex + 1]
      : null;
  const prevLecture =
    lectures && currentIndex > 0 ? lectures[currentIndex - 1] : null;

  const isVideoComplete =
    currentLecture?.isCompletedVideoCourseSection ?? false;
  const hasReviewQuestions =
    (currentLecture?.totalQuestionLectureReviewTest ?? 0) > 0;
  const hasCompletedReview =
    currentLecture?.isCompletedLectureReviewQuestion ?? false;

  // Calculate completion threshold based on video duration
  // For short videos (< 10 seconds), use 50% threshold; otherwise use 80%
  const videoDuration = currentLecture?.videoDuration || 0;
  const isShortVideo = videoDuration < 10;
  const completionThreshold = isShortVideo ? 50 : 80;

  // Calculate if video meets completion threshold (for real-time feedback)
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isVideoWatchedEnough = progressPercentage >= completionThreshold;

  // Check if review questions should be unlocked (either from backend saved state or current watch progress)
  const canAccessReviewQuestions = isVideoComplete || isVideoWatchedEnough;

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
      },
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
      },
    );
  };

  const handleBackToCourse = () => {
    const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(
      ':id',
      courseId,
    );
    navigate(courseRoute);
  };

  const handleGoToReview = () => {
    const reviewRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE_REVIEW.replace(
      ':courseId',
      courseId,
    ).replace(':lectureId', lectureId);
    navigate(reviewRoute);
  };

  const handleNextLecture = () => {
    if (nextLecture) {
      const nextRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE.replace(
        ':courseId',
        courseId,
      ).replace(':lectureId', nextLecture.courseSectionId);
      navigate(nextRoute);
    }
  };

  const handlePrevLecture = () => {
    if (prevLecture) {
      const prevRoute = STUDENT_WEB_ROUTES.COURSE_LECTURE.replace(
        ':courseId',
        courseId,
      ).replace(':lectureId', prevLecture.courseSectionId);
      navigate(prevRoute);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài giảng...</p>
        </div>
      </div>
    );
  }

  if (error || !currentLecture) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <MdWarning className="text-red-600 mx-auto mb-4" size={72} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy bài giảng
          </h2>
          <p className="text-gray-600 mb-6">
            Bài giảng bạn đang tìm không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <button
            onClick={handleBackToCourse}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCourse}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              <MdArrowBack size={20} />
              Quay lại khóa học
            </button>
            <div className="flex items-center gap-4">
              {isVideoComplete && (
                <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <MdCheckCircle size={16} />
                  Đã xem hết video
                </span>
              )}
              {hasCompletedReview && (
                <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <MdCheckCircle size={16} />
                  Đã hoàn thành ôn tập
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                      <p className="text-lg">Không có video</p>
                    </div>
                  </div>
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
                        const obj =
                          typeof raw === 'string' ? JSON.parse(raw) : raw;
                        const meta = obj?.metadata ?? obj;
                        const main =
                          meta?.mainContent ??
                          meta?.content ??
                          meta?.description;
                        const target = meta?.target ?? meta?.objective;
                        return (
                          <>
                            {main && (
                              <RichTextContent value={stringToRichText(main)} />
                            )}
                            {target && (
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                  Mục tiêu
                                </h3>
                                <RichTextContent
                                  value={stringToRichText(target)}
                                />
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
                    <span>
                      Thời lượng: {Math.floor(currentLecture.videoDuration / 60)}{' '}
                      phút
                    </span>
                  )}
                  {currentLecture.totalCredits && (
                    <span>Tín chỉ: {currentLecture.totalCredits}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-4">
              {hasReviewQuestions && canAccessReviewQuestions && (
                <button
                  onClick={handleGoToReview}
                  className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  {hasCompletedReview
                    ? 'Làm lại câu hỏi ôn tập'
                    : 'Làm câu hỏi ôn tập'}
                  <MdArrowForward size={20} />
                </button>
              )}

              {(!hasReviewQuestions || hasCompletedReview) && nextLecture && (
                <button
                  onClick={handleNextLecture}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                >
                  Bài tiếp theo: {nextLecture.title}
                  <MdArrowForward size={20} />
                </button>
              )}

              {hasReviewQuestions && !canAccessReviewQuestions && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Xem ít nhất 80% video để mở khóa câu hỏi ôn tập.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Lecture List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Nội dung khóa học
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {lectures?.map((lecture, index) => (
                  <div
                    key={lecture.id}
                    onClick={() => {
                      if (lecture.courseSectionId !== lectureId) {
                        const route = STUDENT_WEB_ROUTES.COURSE_LECTURE.replace(
                          ':courseId',
                          courseId,
                        ).replace(':lectureId', lecture.courseSectionId);
                        navigate(route);
                      }
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      lecture.courseSectionId === lectureId
                        ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                        : 'hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 hover:shadow-sm'
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
                            {Math.floor(lecture.videoDuration / 60)} phút
                          </p>
                        )}
                      </div>
                      {lecture.isCompletedCourseSection && (
                        <MdCheckCircle
                          className="flex-shrink-0 text-green-600"
                          size={20}
                        />
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
                  Trước
                </button>
                <button
                  onClick={handleNextLecture}
                  disabled={!nextLecture}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Tiếp
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
