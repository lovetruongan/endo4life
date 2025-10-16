import {
  BaseApi,
  CourseV1Api,
  MinioV1Api,
  TestV1Api,
} from '@endo4life/data-access';
import {
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { EnvConfig } from '@endo4life/feature-config';
import { DEFAULT_PAGINATION } from '../constants';
import {
  ICourseEntity,
  CourseFilter,
  CourseMapper,
  ICourseInfoFormData,
  ICourseTestEntity,
} from '../types';
import { CourseTestMapper } from './course-test-mapper';
import { IQuestionEntity } from '@endo4life/feature-test';
import axios from 'axios';
import { getObjectKeyFromSignedUrl } from '@endo4life/util-common';

export interface ICourseTestApi {
  getTests(courseId: string): Promise<ICourseTestEntity[]>;
  getTest(
    courseId: string,
    type: string,
    courseSectionId?: string,
  ): Promise<ICourseTestEntity>;

  createTest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): Promise<string | undefined>;
  updateTest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): Promise<any>;
}

export class CourseTestApiImpl extends BaseApi implements ICourseTestApi {
  constructor() {
    super(EnvConfig.ElearningServiceUrl);
  }
  async uploadFile(presignedUrl: string, file: File) {
    return axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    });
  }
  async uploadImages(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ) {
    const transformedQuestions: Record<string, IQuestionEntity> = {};
    const config = await this.getApiConfiguration();
    const presignApi = new MinioV1Api(config);
    const imageToUploads = test.questionIds
      .map((questionId) => questions[questionId])
      .filter((item) => {
        return !!item.image?.file;
      });

    let presignUrls: string[] = [];

    if (imageToUploads.length > 0) {
      presignUrls = await presignApi
        .generatePreSignedUrls({
          generatePreSignedUrlDto: {
            resourceType: 'IMAGE',
            numberOfUrls: imageToUploads.length,
          },
        })
        .then((res) => res.data);
    }

    let idx = 0;
    for (let i = 0; i < test.questionIds.length; i++) {
      const questionId = test.questionIds[i];
      const question = questions[questionId];
      if (question.image && question.image.file) {
        const file: File = question.image.file;
        const presignUrl = presignUrls[idx++];
        await this.uploadFile(presignUrl, file);
        const objectKey = getObjectKeyFromSignedUrl(presignUrl);
        transformedQuestions[questionId] = {
          ...question,
          image: {
            ...question.image,
            uploadResponse: {
              objectKey,
              bucket: 'images',
              width: question.image.width || 480,
              height: question.image.height || 320,
              fileName: question.image.fileName || file.name,
              fileSize: question.image.fileSize || file.size,
              fileType: question.image.extension || file.type,
            },
          },
        };

        continue;
      }
      transformedQuestions[questionId] = { ...question };
    }

    return transformedQuestions;
  }

  async createTest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): Promise<string | undefined> {
    const config = await this.getApiConfiguration();
    const api = new TestV1Api(config);
    const mapper = new CourseTestMapper();

    const payload = mapper.toCreateRequest(test, questions);
    return api.createTest(payload).then((res) => res.data.id);
  }
  async updateTest(
    test: ICourseTestEntity,
    questions: Record<string, IQuestionEntity>,
  ): Promise<any> {
    const testQuestions = await this.uploadImages(test, questions);
    const config = await this.getApiConfiguration();
    const api = new TestV1Api(config);
    const mapper = new CourseTestMapper();
    const payload = mapper.toUpdateRequest(test, testQuestions);
    const response = await api.updateTest(payload);
    return response.data;
  }
  async getTest(
    courseId: string,
    type: string,
    courseSectionId?: string,
  ): Promise<ICourseTestEntity> {
    const config = await this.getApiConfiguration();
    const api = new TestV1Api(config);
    const mapper = new CourseTestMapper();
    const response = await api.getTestByCourseIdAndType({
      courseId,
      type,
    });
    return mapper.fromDto(response.data);
  }
  async getTests(courseId: string): Promise<ICourseTestEntity[]> {
    const config = await this.getApiConfiguration();
    const api = new TestV1Api(config);
    throw new Error('Method not implemented.');
  }

  async getCourses(
    filter: IFilter,
  ): Promise<IPaginatedResponse<ICourseEntity>> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseFilter = new CourseFilter(filter);
    const criteria = courseFilter.toCriteria();
    const pageable = courseFilter.toPageable();
    const response = await api.getCourses({ criteria, pageable });
    const courseMapper = new CourseMapper();
    return {
      data: response.data.data?.map(courseMapper.fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getCourseById(courseId: string): Promise<IResponse<ICourseEntity>> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const response = await api.getCourseById({ id: courseId });
    const courseMapper = new CourseMapper();
    return {
      data: courseMapper.fromDto(response.data),
    };
  }

  async createCourse(data: ICourseInfoFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseMapper = new CourseMapper();
    await api.createCourse(courseMapper.toCreateCourseRequest(data));
    return;
  }

  async updateCourse(data: ICourseInfoFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    const courseMapper = new CourseMapper();
    await api.updateCourse(courseMapper.toUpdateCourseRequest(data));
    return;
  }

  async deleteCourse(id: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    await api.deleteCourse({ id });
    return;
  }

  async deleteCourses(ids: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new CourseV1Api(config);
    for (const id of ids) {
      await api.deleteCourse({ id });
    }
    return;
  }
}
