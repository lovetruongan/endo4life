import {
  QuestionResponseDto,
  QuestionType,
} from '@endo4life/data-access';

import {
  IQuestionEntity,
  QuestionTypeEnum,
} from '@endo4life/feature-test';
import {
  IImageUploadableEntity,
  IRichText,
} from '@endo4life/types';
import { localUuid } from '@endo4life/util-common';

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

interface AnswerMetadata {
  id?: string;
  content?: string;
  isCorrect?: boolean;
  essay_answer?: string;
}

export interface ICourseQuestionMapper {
  fromDto(dto: QuestionResponseDto): IQuestionEntity;
}

export class CourseQuestionMapper implements ICourseQuestionMapper {
  getAnswersMetadata(dto: QuestionResponseDto): AnswerMetadata[] {
    try {
      if (!dto.answers) return [];
      
      // If answers is already an object with metadata, use it directly
      if (typeof dto.answers === 'object' && 'metadata' in dto.answers) {
        return (dto.answers as { metadata: AnswerMetadata[] }).metadata || [];
      }
      
      // Otherwise, try to parse it as a string
      if (typeof dto.answers === 'string') {
        const answerMetadatas: AnswerMetadata[] =
          JSON.parse(dto.answers)?.metadata || [];
        return answerMetadatas;
      }
    } catch (error) {
      // Silently handle JSON parse errors
    }

    return [];
  }
  fromDto(dto: QuestionResponseDto): IQuestionEntity {
    const type = mapQuestionTypeFromBackend(dto.type);
    const answerMetadatas = this.getAnswersMetadata(dto);
    const isFreeText = type === QuestionTypeEnum.FREE_TEXT;
    const answers = isFreeText
      ? []
      : answerMetadatas?.map((item) => {
          return {
            id: item.id || localUuid(),
            content: { content: item.content || '' },
            isCorrect: item.isCorrect,
          };
        });

    let answer: IRichText | undefined = undefined;
    if (isFreeText && answerMetadatas.length > 0) {
      const essayAnswer = answerMetadatas[0].essay_answer;
      answer = essayAnswer ? { content: essayAnswer } : undefined;
    }
    let image: IImageUploadableEntity | undefined = undefined;
    if (dto.attachments && dto.attachments.length > 0) {
      const attachment = dto.attachments[0];
      if (attachment) {
        image = {
          id: attachment.id || localUuid(),
          src: attachment.fileUrl,
          width: attachment.width,
          height: attachment.height,
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          extension: attachment.fileType,
        };
      }
    }
    return {
      id: dto.id || localUuid(),
      instruction: {
        content: dto.title || '',
      },
      content: {
        content: dto.description || '',
      },
      image,
      answers: answers,
      answer: answer,
      type: dto.type as QuestionTypeEnum,
      metadata: dto,
    };
  }
}
