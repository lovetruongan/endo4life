import {
  CourseResponseDto,
  CourseState,
  CourseV1ApiCreateCourseRequest,
  CourseV1ApiUpdateCourseRequest,
} from '@endo4life/data-access';
import { ICourseEntity } from './course-entity';
import { ICourseFormData, ICourseInfoFormData } from './course-formdata';
import {
  isLocalUuid,
  localUuid,
  stringToRichText,
  urlToUploadableImageEntity,
} from '@endo4life/util-common';

export interface ICourseMapper {
  fromDto(dto: CourseResponseDto): ICourseEntity;
  toFormData(entity: ICourseEntity): ICourseFormData;
  toUpdateCourseRequest(
    data: ICourseInfoFormData,
  ): CourseV1ApiUpdateCourseRequest;
  toUpdateRequestV2(data: ICourseFormData): CourseV1ApiUpdateCourseRequest;
  toCreateRequest(data: ICourseFormData): CourseV1ApiCreateCourseRequest;
}

export class CourseMapper implements ICourseMapper {
  toFormData(entity: ICourseEntity): ICourseFormData {
    return {
      id: entity.id,
      title: entity.title || '',
      description: entity.description,
      author: entity.author,
      state: entity.status,
      tags: entity.tags,
      detailTags: entity.detailTags,
      thumbnail: entity.thumbnail,
    };
  }
  fromDto(dto: CourseResponseDto): ICourseEntity {
    return {
      id: dto.id || localUuid(),
      title: dto.title || '',
      description: stringToRichText(dto.description),
      author: dto.lecturer,
      status: dto.state,
      tags: dto.tags,
      detailTags: dto.tagsDetail,
      thumbnail: urlToUploadableImageEntity(dto.thumbnailUrl),
      updatedAt: dto.updatedAt,
    };
  }
  toUpdateCourseRequest(
    data: ICourseInfoFormData,
  ): CourseV1ApiUpdateCourseRequest {
    if (!data.id) throw new Error('Invalid Course');
    return {
      id: data.id,
      updateCourseRequestDto: {
        state: data.course.state,
        title: data.course.title,
        description: data.course.description,
        lecturer: data.course.lecturer,
        tags: data.course.tags
          ? data.course.tags.split(',').map((tag) => tag.trim())
          : undefined,
        tagsDetail: data.course.tagsDetail
          ? data.course.tagsDetail.split(',').map((tag) => tag.trim())
          : undefined,
      },
    };
  }

  toUpdateRequestV2(data: ICourseFormData): CourseV1ApiUpdateCourseRequest {
    if (!data.id) throw new Error('Invalid Course');
    let thumbnail: string | undefined = data.thumbnail?.id;
    if (data.thumbnail?.id && isLocalUuid(data.thumbnail.id)) {
      thumbnail = undefined;
    }

    return {
      id: data.id,
      updateCourseRequestDto: {
        thumbnail,
        state: data.state as CourseState,
        title: data.title,
        description: data.description?.content,
        lecturer: data.author,
        tags: data.tags,
        tagsDetail: data.detailTags,
      },
    };
  }

  toCreateCourseRequest(
    data: ICourseInfoFormData,
  ): CourseV1ApiCreateCourseRequest {
    return {
      createCourseRequestDto: {
        state: data.course.state,
        title: data.course.title,
        description: data.course.description,
        lecturer: data.course.lecturer,
        tags: data.course.tags
          ? data.course.tags.split(',').map((tag) => tag.trim())
          : undefined,
        tagsDetail: data.course.tagsDetail
          ? data.course.tagsDetail.split(',').map((tag) => tag.trim())
          : undefined,
      },
    };
  }
  toCreateCourseRequestV2(
    data: ICourseFormData,
  ): CourseV1ApiCreateCourseRequest {
    return {
      createCourseRequestDto: {
        state: data.state as CourseState,
        title: data.title,
        description: data.description?.content || '',
        lecturer: data.author || '',
        tags: data.tags,
        tagsDetail: data.detailTags,
      },
    };
  }
  toCreateRequest(data: ICourseFormData): CourseV1ApiCreateCourseRequest {
    return {
      createCourseRequestDto: {
        state: data.state as CourseState,
        title: data.title,
        description: data.description?.content || '',
        lecturer: data.author || '',
        tags: data.tags,
        tagsDetail: data.detailTags,
        thumbnail: data.thumbnail?.id,
      },
    };
  }
  toUpdateFormData(entity?: CourseResponseDto): ICourseInfoFormData {
    return {
      id: entity?.id,
      course: {
        state: entity?.state,
        title: entity?.title || '',
        lecturer: entity?.lecturer || '',
        tags: entity?.tags ? entity?.tags.join(', ').trim() : '',
        tagsDetail: entity?.tagsDetail
          ? entity?.tagsDetail.join(', ').trim()
          : '',
        description: entity?.description || '',
      },
      thumbnailUrl: entity?.thumbnailUrl || '',
    };
  }
}
