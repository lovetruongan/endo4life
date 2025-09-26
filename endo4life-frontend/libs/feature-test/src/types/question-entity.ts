import {
  BaseEntity,
  IImageUploadableEntity,
  IImageUploadableFormData,
  imageUploadableSchema,
  IRichText,
  richtextSchema,
} from '@endo4life/types';
import { answerSchema, IAnswerEntity } from './answer-entity';
import * as yup from 'yup';
import { v4 } from 'uuid';
import { localUuid } from '@endo4life/util-common';
import { arrayMove } from '@dnd-kit/sortable';
export interface IQuestionEntity extends BaseEntity {
  id: string;
  instruction?: IRichText;
  content?: IRichText;
  image?: IImageUploadableEntity;
  answers?: IAnswerEntity[];
  answer?: IRichText;
  type?: QuestionTypeEnum;
  isDeleted?: boolean;
}

export enum QuestionTypeEnum {
  SINGLE_CHOICE = 'SINGLE_SELECT',
  MULTIPLE_CHOICE = 'MULTIPLE_SELECT',
  FREE_TEXT = 'FREE_TEXT',
}

export interface IQuestionFormData {
  id: string;
  instruction?: IRichText;
  content?: IRichText;
  image?: IImageUploadableFormData;
  answers?: IAnswerEntity[];
  type?: QuestionTypeEnum;
}

export const questionSchema = yup.object({
  id: yup.string().required().default(v4()),
  instruction: richtextSchema.optional(),
  content: richtextSchema.optional(),
  image: imageUploadableSchema.optional(),
  answers: yup.array().of(answerSchema),
  type: yup.mixed<QuestionTypeEnum>().oneOf(Object.values(QuestionTypeEnum)),
});

export interface IQuestionAnswerEntity extends BaseEntity {
  questionId: string;
  // used for SINGLE_CHOICE | MULITPLE_CHOICE questions.
  answerIds?: string[];
  // used for FREE_TEXT questions.
  text?: IRichText;
  userId?: string;
}

export class QuestionBuilder implements IQuestionEntity {
  instruction?: IRichText;
  content?: IRichText;
  image?: IImageUploadableEntity;
  answers?: IAnswerEntity[];
  answer?: IRichText;
  type?: QuestionTypeEnum = QuestionTypeEnum.SINGLE_CHOICE;
  id: string = localUuid();
  status?: string;
  createdAt?: string = new Date().toISOString();
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  metadata?: any;
  isNew?: boolean;
  dirty?: boolean;
  isDeleted?: boolean;
  constructor(question?: IQuestionEntity) {
    if (question) {
      Object.assign(this, question);
    }
  }

  public getInstruction(): IRichText | undefined {
    return this.instruction;
  }

  public setInstruction(instruction: IRichText) {
    this.instruction = instruction;
    return this;
  }

  public getContent(): IRichText | undefined {
    return this.content;
  }

  public setContent(content: IRichText) {
    this.content = content;
    return this;
  }

  public getImage(): IImageUploadableEntity | undefined {
    return this.image;
  }

  public setImage(image: IImageUploadableEntity) {
    this.image = image;
    return this;
  }

  public getAnswers(): IAnswerEntity[] | undefined {
    return this.answers;
  }

  public setAnswers(answers: IAnswerEntity[]) {
    this.answers = answers;
    return this;
  }

  public getAnswer(): IRichText | undefined {
    return this.answer;
  }

  public setAnswer(answer?: IRichText) {
    this.answer = answer;
    return this;
  }

  public getType(): QuestionTypeEnum | undefined {
    return this.type;
  }

  public setType(type: QuestionTypeEnum) {
    this.type = type;
    return this;
  }

  public getId(): string {
    return this.id;
  }

  public setId(id: string) {
    this.id = id;
    return this;
  }

  public setIsDeleted(isDeleted?: boolean) {
    this.isDeleted = isDeleted;
    return this;
  }

  public getIsDeleted() {
    return this.isDeleted;
  }

  public getStatus(): string | undefined {
    return this.status;
  }

  public setStatus(status: string) {
    this.status = status;
    return this;
  }

  public getCreatedAt(): string | undefined {
    return this.createdAt;
  }

  public setCreatedAt(createdAt: string) {
    this.createdAt = createdAt;
    return this;
  }

  public getUpdatedAt(): string | undefined {
    return this.updatedAt;
  }

  public setUpdatedAt(updatedAt: string) {
    this.updatedAt = updatedAt;
    return this;
  }

  public getCreatedBy(): string | undefined {
    return this.createdBy;
  }

  public setCreatedBy(createdBy: string) {
    this.createdBy = createdBy;
    return this;
  }

  public getUpdatedBy(): string | undefined {
    return this.updatedBy;
  }

  public setUpdatedBy(updatedBy: string) {
    this.updatedBy = updatedBy;
    return this;
  }

  public getMetadata(): any {
    return this.metadata;
  }

  public setMetadata(metadata: any) {
    this.metadata = metadata;
    return this;
  }

  public isIsNew(): boolean | undefined {
    return this.isNew;
  }

  public setIsNew(isNew: boolean) {
    this.isNew = isNew;
    return this;
  }

  public isDirty(): boolean | undefined {
    return this.dirty;
  }

  public setDirty(dirty: boolean) {
    this.dirty = dirty;
    return this;
  }

  swapAnswer(oldIndex: number, newIndex: number) {
    const items = [...(this.answers || [])];
    this.answers = arrayMove(items, oldIndex, newIndex);
    return this;
  }

  removeAnswer(answerId: string) {
    this.answers = this.answers?.filter((item) => item.id !== answerId);
    return this;
  }

  selectAnswer(answerId: string) {
    console.log('selectAnswer', this.build(), answerId);
    if (QuestionTypeEnum.MULTIPLE_CHOICE === this.type) {
      this.answers = this.answers?.map((item) => {
        if (item.id === answerId) {
          return { ...item, isCorrect: !item.isCorrect };
        }
        return item;
      });
    } else if (QuestionTypeEnum.SINGLE_CHOICE === this.type) {
      this.answers = this.answers?.map((item) => {
        return {
          ...item,
          isCorrect: item.id === answerId,
        };
      });
    }
    console.log('selectAnswerAfter', this.build(), answerId);
    return this;
  }

  updateAnswer(answer: IAnswerEntity) {
    this.answers = this.answers?.map((item) => {
      return item.id === answer.id ? answer : item;
    });
    return this;
  }

  changeQuestionType(type?: QuestionTypeEnum) {
    this.type = type;
    if (QuestionTypeEnum.FREE_TEXT === type) {
      this.answers = undefined;
    } else {
      this.answers = this.answers?.map((item) => {
        return { ...item, isCorrect: false };
      });
    }
  }

  onFileSelected(selectedFile: File) {
    const image: IImageUploadableEntity = {
      id: localUuid(),
      src: URL.createObjectURL(selectedFile),
      width: this.image?.width ?? 480,
      height: this.image?.height ?? 320,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      extension: selectedFile.type,
      base64: undefined,
      file: selectedFile,
    };

    this.image = image;

    return this;
  }

  updateImageSize(width: number, height: number) {
    if (this.image) {
      this.image = { ...this.image, width, height };
    }
    return this;
  }

  removeImage() {
    this.image = undefined;
    return this;
  }

  updateContent(content?: IRichText) {
    this.content = content;
    return this;
  }

  addAnswer() {
    this.answers = [
      ...(this.answers || []),
      {
        id: localUuid(),
        content: {
          content: '',
        },
      },
    ];
    return this;
  }

  build(): IQuestionEntity {
    return {
      instruction: this.instruction,
      content: this.content,
      image: this.image,
      answers: this.answers,
      answer: this.answer,
      type: this.type,
      id: this.id,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      metadata: this.metadata,
      isNew: this.isNew,
      dirty: this.dirty,
      isDeleted: this.isDeleted,
    };
  }
}
