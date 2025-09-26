import {
  AnswerMetadata,
  QuestionDto,
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

export interface ICourseQuestionMapper {
  fromDto(dto: QuestionDto): IQuestionEntity;
}

export class CourseQuestionMapper implements ICourseQuestionMapper {
  getAnswersMetadata(dto: QuestionDto): AnswerMetadata[] {
    try {
      let metadataStr: string = (dto as any)?.answers;
      const answerMetadatas: AnswerMetadata[] =
        JSON.parse(metadataStr)?.metadata || [];
      return answerMetadatas;
    } catch (error) {}

    return [];
  }
  fromDto(dto: QuestionDto): IQuestionEntity {
    const type = dto.type as QuestionTypeEnum;
    const answerMetadatas = this.getAnswersMetadata(dto);
    const isFreeText = type === QuestionTypeEnum.FREE_TEXT;
    let answers = isFreeText
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
    if (dto.questionAttachments && dto.questionAttachments.length > 0) {
      const attchment = dto.questionAttachments[0];
      if (attchment) {
        image = {
          id: attchment.id || localUuid(),
          src: attchment.objectKeyUrl,
          width: attchment.width,
          height: attchment.height,
          fileName: attchment.fileName,
          fileSize: attchment.fileSize,
          extension: attchment.fileType,
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
