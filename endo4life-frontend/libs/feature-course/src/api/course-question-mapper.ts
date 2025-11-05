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
  content?: string | { content?: string };  // Can be string (old) or object (new)
  isCorrect?: boolean;
  essay_answer?: string;
}

export interface ICourseQuestionMapper {
  fromDto(dto: QuestionResponseDto): IQuestionEntity;
}

export class CourseQuestionMapper implements ICourseQuestionMapper {
  getAnswersMetadata(dto: QuestionResponseDto): AnswerMetadata[] {
    try {
      console.log('getAnswersMetadata - dto.answers:', dto.answers, 'type:', typeof dto.answers, 'isArray:', Array.isArray(dto.answers));
      
      if (!dto.answers) return [];
      
      // IMPORTANT: Check if it's an array FIRST (arrays are objects in JS)
      if (Array.isArray(dto.answers)) {
        console.log('Using direct array format, count:', dto.answers.length);
        return dto.answers as AnswerMetadata[];
      }
      
      // If answers is an object with metadata property
      if (typeof dto.answers === 'object' && 'metadata' in dto.answers) {
        console.log('Using object.metadata format, count:', (dto.answers as any).metadata?.length);
        return (dto.answers as { metadata: AnswerMetadata[] }).metadata || [];
      }
      
      // Otherwise, try to parse it as a string
      if (typeof dto.answers === 'string') {
        const parsed = JSON.parse(dto.answers);
        console.log('Parsed string answers:', parsed);
        
        // New format (after backend unwrapMetadata fix): [{id, content, isCorrect}]
        if (Array.isArray(parsed)) {
          console.log('Using array format, count:', parsed.length);
          return parsed;
        }
        
        // Old format (with metadata wrapper): {metadata: [{content, isCorrect}]}
        if (parsed && typeof parsed === 'object' && 'metadata' in parsed) {
          console.log('Using parsed.metadata format, count:', parsed.metadata?.length);
          return parsed.metadata || [];
        }
        
        // Fallback: treat the whole thing as an array
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Failed to parse answers:', error);
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
          // Handle both old format (content is string) and new format (content is object)
          let contentObj;
          if (typeof item.content === 'string') {
            // Old format: {content: "text"}
            contentObj = { content: item.content || '' };
          } else if (item.content && typeof item.content === 'object') {
            // New format: {content: {content: "text"}}
            contentObj = item.content;
          } else {
            contentObj = { content: '' };
          }
          
          return {
            id: item.id || localUuid(),
            content: contentObj,
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
      type: type || QuestionTypeEnum.SINGLE_CHOICE,
      metadata: dto,
    };
  }
}
