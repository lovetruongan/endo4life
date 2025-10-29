import {
  CourseState,
  CreateQuestionRequestDto,
  QuestionAttachmentCreateDto,
  QuestionType,
  TestDetailResponseDto,
  TestV1ApiCreateTestRequest,
  TestV1ApiUpdateTestRequest,
  UpdateQuestionRequestDto,
} from '@endo4life/data-access';
import { CourseTestTypeEnum, ICourseTestEntity } from '../types';
import { v4 } from 'uuid';
import { IQuestionEntity, QuestionTypeEnum } from '@endo4life/feature-test';
import { isLocalUuid } from '@endo4life/util-common';

// Map frontend enum to backend enum
function mapQuestionType(frontendType?: QuestionTypeEnum): QuestionType | undefined {
  if (!frontendType) return undefined;
  
  const mapping: Record<QuestionTypeEnum, QuestionType> = {
    [QuestionTypeEnum.SINGLE_CHOICE]: QuestionType.SingleChoice,
    [QuestionTypeEnum.MULTIPLE_CHOICE]: QuestionType.MultipleChoice,
    [QuestionTypeEnum.FREE_TEXT]: QuestionType.Essay,
  };
  
  return mapping[frontendType];
}

// Map backend enum to frontend enum
function mapQuestionTypeFromBackend(backendType?: QuestionType): QuestionTypeEnum | undefined {
  if (!backendType) return undefined;
  
  const mapping: Record<QuestionType, QuestionTypeEnum> = {
    [QuestionType.SingleChoice]: QuestionTypeEnum.SINGLE_CHOICE,
    [QuestionType.MultipleChoice]: QuestionTypeEnum.MULTIPLE_CHOICE,
    [QuestionType.FillInTheBlank]: QuestionTypeEnum.FREE_TEXT,
    [QuestionType.Essay]: QuestionTypeEnum.FREE_TEXT,
  };
  
  return mapping[backendType];
}

export interface ICourseTestMapper {
  fromDto(dto: TestDetailResponseDto): ICourseTestEntity;
  toCreateRequest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): TestV1ApiCreateTestRequest;
  toUpdateRequest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): TestV1ApiUpdateTestRequest;
}

export class CourseTestMapper implements ICourseTestMapper {
  toCreateRequest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): TestV1ApiCreateTestRequest {
    return {
      createTestRequestDto: {
        title: test.title || '',
        description: test.description,
        courseId: test.courseId || '',
        state: test.status,
        type: test.type,
        // @ts-ignore - questions field added to OpenAPI spec but API client not regenerated yet
        questions: test.questionIds.map((questionId) => {
          const question = questions[questionId];
          const questionDto: CreateQuestionRequestDto = {
            title: question.instruction?.content || '',
            type: mapQuestionType(question.type) || QuestionType.SingleChoice,
            description: question.content?.content,
            answers: {
              metadata: question.answers?.map((answer) => {
                return {
                  content: answer.content?.content || '',
                  isCorrect: !!answer.isCorrect,
                };
              }),
            },
            attachments: undefined,
          };
          return questionDto;
        }),
      },
    };
  }
  toUpdateRequest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): TestV1ApiUpdateTestRequest {
    return {
      id: test.id,
      updateTestRequestDto: {
        title: test.title,
        description: test.description,
        state: test.status,
        type: test.type,
        // @ts-ignore - questions field added to OpenAPI spec but API client not regenerated yet
        questions: test.questionIds.map((questionId) => {
          const question = questions[questionId];
          const questionDto: UpdateQuestionRequestDto = {
            title: question.instruction?.content,
            type: mapQuestionType(question.type) || QuestionType.SingleChoice,
            description: question.content?.content,
            answers: {
              metadata: question.answers?.map((answer) => {
                return {
                  content: answer.content?.content || '',
                  isCorrect: !!answer.isCorrect,
                };
              }),
            },
            attachments: question.image?.uploadResponse
              ? [question.image?.uploadResponse]
              : undefined,
          };
          return questionDto;
        }),
      },
    };
  }
  fromDto(dto: TestDetailResponseDto): ICourseTestEntity {
    return {
      id: dto.id || v4(),
      courseId: dto.courseId || '',
      type: dto.type as CourseTestTypeEnum,
      questionIds:
        dto.questions?.map((item: any) => item.id || '').filter((item: any) => !!item) ||
        [],
      title: dto.title,
      description: dto.description,
      status: dto.state,
      metadata: dto,
    };
  }
}
