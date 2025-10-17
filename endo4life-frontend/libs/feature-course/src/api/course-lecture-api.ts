import { BaseApi } from '@endo4life/data-access';
import { ICourseLectureEntity } from '../types';
import { EnvConfig } from '@endo4life/feature-config';

export interface ICourseLectureApi {
  getLectures(courseId: string): Promise<ICourseLectureEntity[]>;
  getLectureById(lectureId: string): Promise<ICourseLectureEntity>;
}

export class CourseLectureApiImpl extends BaseApi implements ICourseLectureApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }
  getLectures(courseId: string): Promise<ICourseLectureEntity[]> {
    throw new Error('Method not implemented.');
  }
  getLectureById(lectureId: string): Promise<ICourseLectureEntity> {
    throw new Error('Method not implemented.');
  }
}
