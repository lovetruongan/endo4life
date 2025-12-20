import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@endo4life/feature-auth';
import {
  useFinalExam,
  useTestSubmission,
  useCourseProgressStatus,
} from '@endo4life/feature-resources';
import { StudentTestContainer } from '@endo4life/feature-resources';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { toast } from 'react-toastify';
import { MdEmojiEvents, MdDownload, MdWarning, MdSchool, MdGpsFixed, MdCheck } from 'react-icons/md';
import { useState } from 'react';
import { useCourseCertificate } from '@endo4life/feature-user';

export function FinalExamPage() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();
  const [showCongratulations, setShowCongratulations] = useState(false);

  const { data: progressStatus } = useCourseProgressStatus(userInfoId, courseId, true);

  const {
    data: test,
    loading,
    error,
  } = useFinalExam(courseId, userInfoId);

  const { mutation: submitMutation } = useTestSubmission();

  // Check if all lectures are completed
  const allLecturesCompleted = progressStatus?.isCompletedTotalCourseSection ?? false;
  const hasCompletedFinalExam = progressStatus?.isCompletedFinalCourseTest ?? false;

  // Fetch certificate only if course is completed
  const { data: certificate, isLoading: certificateLoading } = useCourseCertificate(
    courseId,
    userInfoId
  );

  // If not all lectures completed, redirect
  if (!loading && !allLecturesCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <MdWarning className="text-yellow-600 mx-auto mb-4" size={72} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa hoàn thành bài giảng
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn phải hoàn thành tất cả bài giảng và câu hỏi ôn tập trước khi làm bài thi cuối khóa.
          </p>
          <button
            onClick={() => {
              const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', courseId);
              navigate(courseRoute);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Back to Course
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
      console.error('Failed to submit final exam:', error);
      toast.error('Gửi bài thi thất bại. Vui lòng thử lại.', {
        position: 'top-right',
        autoClose: 3000,
      });
      throw error;
    }
  };

  const handleTestComplete = (result: any) => {
    if (result.passed) {
      setShowCongratulations(true);
      toast.success('Chúc mừng! Bạn đã vượt qua bài thi cuối khóa và hoàn thành khóa học!', {
        position: 'top-right',
        autoClose: 10000,
      });
    } else {
      toast.error('Bạn chưa vượt qua bài thi cuối khóa. Hãy xem lại tài liệu và thử lại.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleClose = () => {
    const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', courseId);
    navigate(courseRoute);
  };

  const handleDownloadCertificate = () => {
    if (certificate?.fileUrl) {
      // Open certificate in new tab to download
      window.open(certificate.fileUrl, '_blank');
      toast.success('Bắt đầu tải chứng chỉ!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } else if (certificateLoading) {
      toast.info('Đang tải chứng chỉ...', {
        position: 'top-right',
        autoClose: 2000,
      });
    } else {
      toast.error('Chứng chỉ chưa có sẵn. Vui lòng liên hệ hỗ trợ.', {
      position: 'top-right',
      autoClose: 3000,
    });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài thi cuối khóa...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <MdWarning className="text-red-600 mx-auto mb-4" size={72} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể tải bài thi cuối khóa
          </h2>
          <p className="text-gray-600 mb-6">
            {error
              ? 'Có lỗi khi tải bài thi cuối khóa. Vui lòng thử lại sau.'
              : 'Bài thi cuối khóa không khả dụng cho khóa học này.'}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  // Show congratulations screen if exam is passed
  if (showCongratulations || hasCompletedFinalExam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Trophy Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-8 text-center">
              <MdEmojiEvents className="mx-auto text-white" size={120} />
              <h1 className="text-4xl font-bold text-white mt-4">
                Chúc mừng!
              </h1>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bạn đã hoàn thành khóa học!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Bạn đã vượt qua bài thi cuối khóa và hoàn thành tất cả yêu cầu của khóa học này.
              </p>

              {/* Achievement Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <MdCheck className="text-3xl font-bold text-blue-600 mx-auto" size={32} />
                  <p className="text-sm text-gray-600 mt-2">Bài kiểm tra đầu vào</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <MdCheck className="text-3xl font-bold text-green-600 mx-auto" size={32} />
                  <p className="text-sm text-gray-600 mt-2">Tất cả bài giảng</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <MdCheck className="text-3xl font-bold text-purple-600 mx-auto" size={32} />
                  <p className="text-sm text-gray-600 mt-2">Bài thi cuối khóa</p>
                </div>
              </div>

              {/* Certificate Badge */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 mb-6 border-2 border-blue-300">
                {certificate?.previewImageUrl ? (
                  <img
                    src={certificate.previewImageUrl}
                    alt="Certificate Preview"
                    className="w-full h-auto rounded-lg shadow-lg mb-4"
                  />
                ) : (
                <MdSchool className="mx-auto mb-2 text-blue-700" size={40} />
                )}
                <p className="font-semibold text-gray-900">Chứng chỉ hoàn thành</p>
                <p className="text-sm text-gray-600 mt-2">
                  Trao cho {userProfile?.firstName} {userProfile?.lastName}
                </p>
                {certificate?.issuedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ngày cấp: {new Date(certificate.issuedAt).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadCertificate}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg"
                >
                  <MdDownload size={20} />
                  Tải chứng chỉ
                </button>
                <button
                  onClick={() => {
                    const myLearningRoute = STUDENT_WEB_ROUTES.MY_LEARNING;
                    navigate(myLearningRoute);
                  }}
                  className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border-2 border-gray-300 transition-colors"
                >
                  Khóa học của tôi
                </button>
              </div>

              <button
                onClick={handleClose}
                className="mt-6 text-gray-600 hover:text-gray-900 underline"
              >
                Quay lại trang khóa học
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header Notice */}
      <div className="bg-purple-50 border-b border-purple-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <MdGpsFixed className="text-purple-700" size={24} />
          <div>
            <p className="text-sm font-medium text-purple-800">
              Bài thi cuối khóa - Bài kiểm tra hoàn thành khóa học
            </p>
            <p className="text-xs text-purple-700">
              Vượt qua bài thi này để hoàn thành khóa học và nhận chứng chỉ
            </p>
          </div>
        </div>
      </div>

      <StudentTestContainer
        test={test}
        userInfoId={userInfoId}
        onSubmit={handleSubmit}
        onClose={handleClose}
        onTestComplete={handleTestComplete}
        showAllQuestions={false}
      />
    </div>
  );
}

export default FinalExamPage;

