import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@endo4life/feature-auth';
import { useEntranceTest, useTestSubmission } from '@endo4life/feature-resources';
import { StudentTestContainer } from '@endo4life/feature-resources';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { toast } from 'react-toastify';
import { MdWarning } from 'react-icons/md';

export function EntranceTestPage() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

  const {
    data: test,
    loading,
    error,
  } = useEntranceTest(courseId, userInfoId);

  const { mutation: submitMutation } = useTestSubmission();

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
      console.error('Failed to submit entrance test:', error);
      toast.error('Gửi bài kiểm tra thất bại. Vui lòng thử lại.', {
        position: 'top-right',
        autoClose: 3000,
      });
      throw error;
    }
  };

  const handleTestComplete = (result: any) => {
    if (result.passed) {
      toast.success('Chúc mừng! Bạn đã vượt qua bài kiểm tra đầu vào!', {
        position: 'top-right',
        autoClose: 5000,
      });
    } else {
      toast.error('Bạn chưa vượt qua bài kiểm tra đầu vào. Vui lòng thử lại.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleClose = () => {
    const courseRoute = STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', courseId);
    navigate(courseRoute);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài kiểm tra đầu vào...</p>
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
            Không thể tải bài kiểm tra
          </h2>
          <p className="text-gray-600 mb-6">
            {error
              ? 'Có lỗi khi tải bài kiểm tra đầu vào. Vui lòng thử lại sau.'
              : 'Bài kiểm tra đầu vào không khả dụng cho khóa học này.'}
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

  return (
    <div className="h-screen flex flex-col">
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

export default EntranceTestPage;

