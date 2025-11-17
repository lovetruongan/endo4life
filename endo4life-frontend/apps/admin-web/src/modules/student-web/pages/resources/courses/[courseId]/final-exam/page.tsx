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
            Lectures Not Complete
          </h2>
          <p className="text-gray-600 mb-6">
            You must complete all lectures and their review questions before taking the final exam.
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
      toast.error('Failed to submit final exam. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
      throw error;
    }
  };

  const handleTestComplete = (result: any) => {
    if (result.passed) {
      setShowCongratulations(true);
      toast.success('Congratulations! You passed the final exam and completed the course!', {
        position: 'top-right',
        autoClose: 10000,
      });
    } else {
      toast.error('You did not pass the final exam. Review the course materials and try again.', {
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
      toast.success('Certificate download started!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } else if (certificateLoading) {
      toast.info('Loading certificate...', {
        position: 'top-right',
        autoClose: 2000,
      });
    } else {
      toast.error('Certificate not available yet. Please contact support.', {
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
          <p className="text-gray-600">Loading final exam...</p>
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
            Failed to Load Final Exam
          </h2>
          <p className="text-gray-600 mb-6">
            {error
              ? 'There was an error loading the final exam. Please try again later.'
              : 'The final exam is not available for this course.'}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Back to Course
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
                Congratulations!
              </h1>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You've Completed the Course!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                You've successfully passed the final exam and completed all requirements for this course.
              </p>

              {/* Achievement Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <MdCheck className="text-3xl font-bold text-blue-600 mx-auto" size={32} />
                  <p className="text-sm text-gray-600 mt-2">Entrance Test</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <MdCheck className="text-3xl font-bold text-green-600 mx-auto" size={32} />
                  <p className="text-sm text-gray-600 mt-2">All Lectures</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <MdCheck className="text-3xl font-bold text-purple-600 mx-auto" size={32} />
                  <p className="text-sm text-gray-600 mt-2">Final Exam</p>
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
                <p className="font-semibold text-gray-900">Certificate of Completion</p>
                <p className="text-sm text-gray-600 mt-2">
                  Awarded to {userProfile?.firstName} {userProfile?.lastName}
                </p>
                {certificate?.issuedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Issued: {new Date(certificate.issuedAt).toLocaleDateString()}
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
                  Download Certificate
                </button>
                <button
                  onClick={() => {
                    const myLearningRoute = STUDENT_WEB_ROUTES.MY_LEARNING;
                    navigate(myLearningRoute);
                  }}
                  className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border-2 border-gray-300 transition-colors"
                >
                  View My Learning
                </button>
              </div>

              <button
                onClick={handleClose}
                className="mt-6 text-gray-600 hover:text-gray-900 underline"
              >
                Back to Course Page
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
              Final Exam - Course Completion Test
            </p>
            <p className="text-xs text-purple-700">
              Pass this exam to complete the course and earn your certificate
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

