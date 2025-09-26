import { BaseEntity } from '@endo4life/types';
import { localUuid } from '@endo4life/util-common';

export interface ICourseTestEntity extends BaseEntity {
  id: string;
  courseId: string;
  courseSectionId?: string;
  questionIds: string[];
  title?: string;
  description?: string;
  type: CourseTestTypeEnum;
}

export enum CourseTestTypeEnum {
  ENTRANCE_TEST_COURSE = 'ENTRANCE_TEST_COURSE',
  FINAL_EXAM_COURSE = 'FINAL_EXAM_COURSE',
  SURVEY_COURSE = 'SURVEY_COURSE',
  LECTURE_REVIEW_QUESTIONS_COURSE = 'LECTURE_REVIEW_QUESTIONS_COURSE',
}

export class CourseTestBuilder implements ICourseTestEntity {
  courseId: string;
  courseSectionId?: string;
  questionIds: string[];
  title?: string | undefined;
  description?: string | undefined;
  type: CourseTestTypeEnum;
  id: string;
  status?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
  metadata?: any;
  isNew?: boolean | undefined;
  dirty?: boolean | undefined;
  constructor(courseId: string, type: CourseTestTypeEnum) {
    this.courseId = courseId;
    this.questionIds = [];
    this.type = type;
    this.id = localUuid();
    this.createdAt = new Date().toISOString();
    this.isNew = true;
    this.dirty = true;
  }

  setCourseId(courseId: string) {
    this.courseId = courseId;
    return this;
  }
  setCourseSectionId(courseSectionId?: string) {
    this.courseSectionId = courseSectionId;
    return this;
  }
  setQuestionIds(questionIds: string[]) {
    this.questionIds = questionIds;
    return this;
  }
  setTitle(title?: string | undefined) {
    this.title = title;
    return this;
  }
  setDescription(description?: string | undefined) {
    this.description = description;
    return this;
  }
  setType(type: CourseTestTypeEnum) {
    this.type = type;
    return this;
  }
  setId(id: string) {
    this.id = id;
    return this;
  }
  setStatus(status?: string | undefined) {
    this.status = status;
    return this;
  }
  setCreatedAt(createdAt?: string | undefined) {
    this.createdAt = createdAt;
    return this;
  }
  setUpdatedAt(updatedAt?: string | undefined) {
    this.updatedAt = updatedAt;
    return this;
  }
  setCreatedBy(createdBy?: string | undefined) {
    this.createdBy = createdBy;
    return this;
  }
  setUpdatedBy(updatedBy?: string | undefined) {
    this.updatedBy = updatedBy;
    return this;
  }
  setMetadata(metadata?: any) {
    this.metadata = metadata;
    return this;
  }
  setIsNew(isNew?: boolean | undefined) {
    this.isNew = isNew;
    return this;
  }
  setDirty(dirty?: boolean | undefined) {
    this.dirty = dirty;
    return this;
  }
  getCourseId() {
    return this.courseId;
  }
  getCourseSectionId() {
    return this.courseSectionId;
  }
  getQuestionIds() {
    return this.questionIds;
  }
  getTitle() {
    return this.title;
  }
  getDescription() {
    return this.description;
  }
  getType() {
    return this.type;
  }
  getId() {
    return this.id;
  }
  getStatus() {
    return this.status;
  }
  getCreatedAt() {
    return this.createdAt;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }
  getCreatedBy() {
    return this.createdBy;
  }
  getUpdatedBy() {
    return this.updatedBy;
  }
  getMetadata() {
    return this.metadata;
  }
  getIsNew() {
    return this.isNew;
  }
  getDirty() {
    return this.dirty;
  }

  build() {
    return {
      courseId: this.courseId,
      courseSectionId: this.courseSectionId,
      questionIds: this.questionIds,
      title: this.title,
      description: this.description,
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
    };
  }
}
