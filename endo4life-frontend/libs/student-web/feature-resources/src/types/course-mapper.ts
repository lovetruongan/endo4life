import {
  CourseResponseDto,
  CourseV1ApiCreateCourseRequest,
  CourseV1ApiUpdateCourseRequest,
} from '@endo4life/data-access';
import { ICourseEntity } from './course-entity';
import { ICourseInfoFormData } from '@endo4life/feature-course';

export interface ICourseMapper {
  fromDto(dto: CourseResponseDto): ICourseEntity;
}

export class CourseMapper implements ICourseMapper {
  private static _instance: CourseMapper | null = null;

  static getInstance(): CourseMapper {
    if (!this._instance) {
      this._instance = new CourseMapper();
    }
    return this._instance;
  }

  private constructor() {}

  fromDto(dto: CourseResponseDto): ICourseEntity {
    if (!dto.id) throw new Error('Invalid Course DTO');
    return {
      id: dto.id,
      title: dto.title,
      state: dto.state,
      description: typeof dto.description === 'string' ? dto.description : '',
      thumbnailUrl: dto.thumbnailUrl,
      lastUpdated: dto.lastUpdated,
      metadata: dto,
      tags: dto.tags,
      tagsDetail: dto.tagsDetail,
    };
  }

  toUpdateCourseRequest(
    data: ICourseInfoFormData,
  ): CourseV1ApiUpdateCourseRequest {
    if (!data.id) throw new Error('Invalid Course');
    return {
      id: data.id,
      metadata: {
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
      thumbnail: data.thumbnail,
    };
  }

  toCreateCourseRequest(
    data: ICourseInfoFormData,
  ): CourseV1ApiCreateCourseRequest {
    return {
      course: {
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
      thumbnail: data.thumbnail,
    };
  }

  toUpdateFormData(entity?: CourseResponseDto): ICourseInfoFormData {
    return {
      id: entity?.id,
      course: {
        state: entity?.state,
        title: entity?.title || '',
        lecturer: entity?.lecturer || '',
        tags: entity?.tags ? entity.tags.join(', ').trim() : '',
        tagsDetail: entity?.tagsDetail
          ? entity.tagsDetail.join(', ').trim()
          : '',
        description: entity?.description || '',
      },
      thumbnailUrl: entity?.thumbnailUrl || '',
    };
  }
}
