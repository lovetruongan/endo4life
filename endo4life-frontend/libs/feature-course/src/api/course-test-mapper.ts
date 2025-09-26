import {
  CourseState,
  DetailTestOfTheCourseDto,
  QuestionAttachmentDto,
  QuestionDto,
  QuestionType,
  TestType,
  TestV1ApiCreateTestRequest,
  TestV1ApiUpdateTestRequest,
} from '@endo4life/data-access';
import { CourseTestTypeEnum, ICourseTestEntity } from '../types';
import { v4 } from 'uuid';
import { IQuestionEntity } from '@endo4life/feature-test';
import { isLocalUuid } from '@endo4life/util-common';

export interface ICourseTestMapper {
  fromDto(dto: DetailTestOfTheCourseDto): ICourseTestEntity;
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
      test: {
        title: test.title,
        description: test.description,
        courseId: test.courseId,
        courseSectionId: test.courseSectionId,
        state: test.status as CourseState,
        type: test.type as TestType,
        questions: test.questionIds.map((questionId) => {
          const question = questions[questionId];
          let questionAttachments: QuestionAttachmentDto[] | undefined =
            undefined;
          const questionDto: QuestionDto = {
            title: question.instruction?.content,
            type: question.type as QuestionType,
            description: question.content?.content,
            answers: {
              metadata: question.answers?.map((answer) => {
                return {
                  content: answer.content?.content || '',
                  isCorrect: !!answer.isCorrect,
                };
              }),
            },
            questionAttachments,
            isDelete: question.isDeleted,
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
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        courseId: test.courseId,
        state: test.status as CourseState,
        type: test.type as TestType,
        questions: test.questionIds.map((questionId) => {
          const question = questions[questionId];
          const questionDto: QuestionDto = {
            id: isLocalUuid(question.id) ? undefined : question.id,
            title: question.instruction?.content,
            type: question.type as QuestionType,
            description: question.content?.content,
            answers: {
              metadata: question.answers?.map((answer) => {
                return {
                  content: answer.content?.content || '',
                  isCorrect: !!answer.isCorrect,
                };
              }),
            },
            questionAttachments: question.image?.uploadResponse
              ? [question.image?.uploadResponse]
              : [],
            isDelete: question.isDeleted,
          };
          return questionDto;
        }),
      },
    };
  }
  fromDto(dto: DetailTestOfTheCourseDto): ICourseTestEntity {
    return {
      id: dto.id || v4(),
      courseId: dto.courseId,
      type: dto.type as CourseTestTypeEnum,
      questionIds:
        dto.questions?.map((item) => item.id || '').filter((item) => !!item) ||
        [],
      title: dto.title,
      description: dto.description,
      status: dto.state,
      metadata: dto,
    };
  }
}
