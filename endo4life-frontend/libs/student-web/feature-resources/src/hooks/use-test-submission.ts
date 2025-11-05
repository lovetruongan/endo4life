import { useMutation, useQueryClient } from 'react-query';
import { StudentTestApiImpl, TestSubmissionDto } from '../api/student-test-api';

interface TestSubmissionParams {
  testId: string;
  submission: TestSubmissionDto;
}

export function useTestSubmission() {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ testId, submission }: TestSubmissionParams) => {
      const api = new StudentTestApiImpl();
      return api.submitTestAnswers(testId, submission);
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries
      client.invalidateQueries(['TEST_QUESTIONS']);
      client.invalidateQueries(['TEST_RESULT']);
      client.invalidateQueries(['COURSE_PROGRESS']);
      client.invalidateQueries(['COURSE_PROGRESS_STATUS']);
      client.invalidateQueries(['COURSE_LECTURES']);
    },
    onError: (error) => {
      console.error('Failed to submit test:', error);
    },
  });

  return { mutation };
}

