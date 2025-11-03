import { BaseApi } from '@endo4life/data-access';
import {
  EnrollCourseV1Api,
  UserCourseV1Api,
  UserCourseLecturesV1Api,
  UserResponseDetailCourseDto,
  UserProgressCourseDto,
  LectureAndTestDto,
  RecordDataUserCourseSectionDto,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';

export interface IStudentCourseApi {
  getUserCourseById(courseId: string, userInfoId: string): Promise<UserResponseDetailCourseDto>;
  enrollUserInCourse(courseId: string, userInfoId: string): Promise<string>;
  getProgressCoursesUser(userInfoId: string): Promise<UserProgressCourseDto[]>;
  getUserCourseLectures(courseId: string, userInfoId: string): Promise<LectureAndTestDto[]>;
  recordLectureProgress(progressId: string, watchTime: number): Promise<string>;
}

export class StudentCourseApiImpl extends BaseApi implements IStudentCourseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  async getUserCourseById(courseId: string, userInfoId: string): Promise<UserResponseDetailCourseDto> {
    const config = await this.getApiConfiguration();
    const api = new UserCourseV1Api(config);
    const response = await api.getUserCourseById({ id: courseId, userInfoId });
    return response.data;
  }

  async enrollUserInCourse(courseId: string, userInfoId: string): Promise<string> {
    const config = await this.getApiConfiguration();
    const api = new EnrollCourseV1Api(config);
    const response = await api.enrollUserInCourse({
      id: courseId,
      userInfoEnrollCourseDto: { userInfoId },
    });
    return response.data.id || '';
  }

  async getProgressCoursesUser(userInfoId: string): Promise<UserProgressCourseDto[]> {
    const config = await this.getApiConfiguration();
    const api = new UserCourseV1Api(config);
    const response = await api.getProgressCoursesUser({ userInfoId });
    return response.data;
  }

  async getUserCourseLectures(courseId: string, userInfoId: string): Promise<LectureAndTestDto[]> {
    const config = await this.getApiConfiguration();
    const api = new UserCourseLecturesV1Api(config);
    const response = await api.getUserCourseLectures({ courseId, userInfoId });
    return response.data;
  }

  async recordLectureProgress(progressId: string, watchTime: number): Promise<string> {
    const config = await this.getApiConfiguration();
    const api = new UserCourseLecturesV1Api(config);
    const response = await api.recordCourseSectionData({
      id: progressId,
      recordDataUserCourseSectionDto: { totalTimeUserWatchedVideo: watchTime },
    });
    return response.data.id || '';
  }
}
