import {
  BaseApi,
  UserTestV1Api,
  StudentTestDto,
  TestSubmissionDto,
  TestResultDto,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';

// Re-export types for convenience
export type {
  StudentTestDto,
  StudentQuestionDto,
  StudentAnswerDto,
  TestSubmissionDto,
  SubmittedAnswerDto,
  TestResultDto,
  QuestionResultDto,
  QuestionAttachmentResponseDto,
} from '@endo4life/data-access';

export interface IStudentTestApi {
  getTestQuestions(testId: string, userInfoId: string): Promise<StudentTestDto>;
  submitTestAnswers(testId: string, submission: TestSubmissionDto): Promise<TestResultDto>;
  getTestResult(testId: string, userInfoId: string): Promise<TestResultDto>;
  getEntranceTest(courseId: string, userInfoId: string): Promise<StudentTestDto>;
  getLectureReviewTest(lectureId: string, userInfoId: string): Promise<StudentTestDto>;
  getFinalExam(courseId: string, userInfoId: string): Promise<StudentTestDto>;
}

export class StudentTestApiImpl extends BaseApi implements IStudentTestApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  async getTestQuestions(testId: string, userInfoId: string): Promise<StudentTestDto> {
    const config = await this.getApiConfiguration();
    const api = new UserTestV1Api(config);
    const response = await api.getStudentTestQuestions({ testId, userInfoId });
    return response.data;
  }

  async submitTestAnswers(testId: string, submission: TestSubmissionDto): Promise<TestResultDto> {
    const config = await this.getApiConfiguration();
    const api = new UserTestV1Api(config);
    const response = await api.submitStudentTest({ testId, testSubmissionDto: submission });
    return response.data;
  }

  async getTestResult(testId: string, userInfoId: string): Promise<TestResultDto> {
    const config = await this.getApiConfiguration();
    const api = new UserTestV1Api(config);
    const response = await api.getStudentTestResult({ testId, userInfoId });
    return response.data;
  }

  async getEntranceTest(courseId: string, userInfoId: string): Promise<StudentTestDto> {
    const config = await this.getApiConfiguration();
    const api = new UserTestV1Api(config);
    const response = await api.getCourseEntranceTest({ courseId, userInfoId });
    return response.data;
  }

  async getLectureReviewTest(lectureId: string, userInfoId: string): Promise<StudentTestDto> {
    const config = await this.getApiConfiguration();
    const api = new UserTestV1Api(config);
    const response = await api.getLectureReviewTest({ lectureId, userInfoId });
    return response.data;
  }

  async getFinalExam(courseId: string, userInfoId: string): Promise<StudentTestDto> {
    const config = await this.getApiConfiguration();
    const api = new UserTestV1Api(config);
    const response = await api.getCourseFinalExam({ courseId, userInfoId });
    return response.data;
  }
}

