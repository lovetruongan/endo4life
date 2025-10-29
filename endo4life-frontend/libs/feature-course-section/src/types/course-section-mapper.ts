import {
  CourseSectionCriteria,
  CourseSectionResponseDto,
  CourseSectionV1ApiCreateCourseSectionRequest,
  CourseSectionV1ApiUpdateCourseSectionRequest,
  CourseSectionV1ApiGetCourseSectionsRequest,
  CourseState,
  CreateCourseSectionRequestDtoAttribute,
  ResponseDetailCourseSectionDto,
} from '@endo4life/data-access';
import { ICourseSectionEntity } from './course-section-entity';
import {
  ICourseSectionCreateFormData,
  ICourseSectionFormData,
} from './course-section-formdata';
import {
  stringToRichText,
  toResourceObjectKey,
  urlToUploadableImageEntity,
  urlToUploadableVideoEntity,
} from '@endo4life/util-common';
import { IFilter } from '@endo4life/types';
import { CourseSectionFilter } from './course-section-filter';

export interface ICourseSectionMapper {
  toFormData(lecture: ICourseSectionEntity): ICourseSectionFormData;
  fromDto(dto: CourseSectionResponseDto): ICourseSectionEntity;
  fromDetailDto(dto: ResponseDetailCourseSectionDto): ICourseSectionEntity;
  toCreateCourseSectionRequest(
    data: ICourseSectionCreateFormData,
  ): CourseSectionV1ApiCreateCourseSectionRequest;
  toCreateRequest(
    data: ICourseSectionFormData,
  ): CourseSectionV1ApiCreateCourseSectionRequest;
  toUpdateRequest(
    data: ICourseSectionFormData,
  ): CourseSectionV1ApiUpdateCourseSectionRequest;
  toGetManyRequest(data: IFilter): CourseSectionV1ApiGetCourseSectionsRequest;
}

export class CourseSectionMapper implements ICourseSectionMapper {
  toGetManyRequest(
    filter: IFilter,
  ): CourseSectionV1ApiGetCourseSectionsRequest {
    const courseSectionFilter = new CourseSectionFilter(filter);
    const pageable = courseSectionFilter.toPageable();
    const criteria: CourseSectionCriteria = {
      courseId: courseSectionFilter.getStringField('courseId'),
    };
    return { pageable, criteria };
  }
  fromDto(dto: CourseSectionResponseDto): ICourseSectionEntity {
    return {
      id: dto.id || '',
      title: dto.title,
      state: dto.state,
      updatedAt: dto.lastUpdated,
      thumbnail: urlToUploadableImageEntity(dto.thumbnailUrl),
    };
  }
  toFormData(lecture: ICourseSectionEntity): ICourseSectionFormData {
    return {
      id: lecture.id,
      title: lecture.title,
      content: lecture.content,
      target: lecture.target,
      requirement: lecture.requirement,
      numCredits: lecture.numCredits,
      tags: lecture.tags,
      detailTags: lecture.detailTags,
      description: lecture.description,
      video: lecture.video,
      thumbnail: lecture.thumbnail,
    };
  }
  fromDetailDto(dto: ResponseDetailCourseSectionDto): ICourseSectionEntity {
    if (!dto.id) throw new Error('Invalid Course Section DTO');
    let attribute: CreateCourseSectionRequestDtoAttribute | undefined =
      undefined;
    try {
      if (dto.attribute) {
        attribute = typeof dto.attribute === 'string' 
          ? JSON.parse(dto.attribute) 
          : dto.attribute;
      }
    } catch (err) {}

    return {
      id: dto.id,
      title: dto.title,
      state: dto.state,
      content: stringToRichText(attribute?.metadata?.mainContent),
      target: stringToRichText(attribute?.metadata?.target),
      requirement: stringToRichText(attribute?.metadata?.lessonObjectives),
      numCredits: 0,
      tags: dto.tags,
      detailTags: dto.tagsDetail,
      description: stringToRichText(attribute?.metadata?.description),
      thumbnail: urlToUploadableImageEntity(dto.thumbnailUrl),
      video: urlToUploadableVideoEntity(dto.attachmentUrl),
      metadata: dto,
    };
  }
  toCreateCourseSectionRequest(
    data: ICourseSectionCreateFormData,
  ): CourseSectionV1ApiCreateCourseSectionRequest {
    return {
      createCourseSectionRequestDto: {
        courseId: data.courseSection.courseId,
        state: data.courseSection.state,
        title: data.courseSection.title,
        tags: data.courseSection.tags
          ? data.courseSection.tags.split(',').map((tag) => tag.trim())
          : undefined,
        tagsDetail: data.courseSection.tagsDetail
          ? data.courseSection.tagsDetail.split(',').map((tag) => tag.trim())
          : undefined,
        totalCredits: data.courseSection.totalCredits,
        attribute: {
          metadata: {
            description: data.courseSection.attribute?.metadata?.description,
            mainContent: data.courseSection.attribute?.metadata?.mainContent,
            lessonObjectives:
              data.courseSection.attribute?.metadata?.lessonObjectives,
            target: data.courseSection.attribute?.metadata?.target,
          },
        },
      },
    };
  }

  toCreateRequest(
    data: ICourseSectionFormData,
  ): CourseSectionV1ApiCreateCourseSectionRequest {
    if (!data.courseId) throw new Error('Invalid course id');
    return {
      createCourseSectionRequestDto: {
        courseId: data.courseId,
        state: data.state as CourseState,
        title: data.title,
        tags: data.tags,
        tagsDetail: data.detailTags,
        totalCredits: data.numCredits,

        attribute: {
          metadata: {
            description: data.description?.content,
            mainContent: data.content?.content,
            lessonObjectives: data.requirement?.content,
            target: data.target?.content,
          },
        },
        thumbnail: toResourceObjectKey(data.thumbnail?.id),
        attachments: toResourceObjectKey(data.video?.id),
      },
    };
  }

  toUpdateRequest(
    data: ICourseSectionFormData,
  ): CourseSectionV1ApiUpdateCourseSectionRequest {
    if (!data.id) throw new Error('Invalid course section id');
    return {
      id: data.id,
      metadata: {
        state: data.state as CourseState,
        title: data.title,
        tags: data.tags,
        tagsDetail: data.detailTags,
        totalCredits: data.numCredits,
        attribute: {
          metadata: {
            description: data.description?.content,
            mainContent: data.content?.content,
            lessonObjectives: data.requirement?.content,
            target: data.target?.content,
          },
        },
        thumbnail: toResourceObjectKey(data.thumbnail?.id),
        attachments: toResourceObjectKey(data.video?.id),
      },
    };
  }
}
