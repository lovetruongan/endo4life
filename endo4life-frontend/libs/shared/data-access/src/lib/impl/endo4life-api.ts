import { EnvConfig } from '@endo4life/feature-config';
import BaseApi from './base-api';
import { 
  UserV1Api, 
  CourseV1Api, 
  ResourceV1Api,
  UserResponseDto,
  CourseResponseDto,
  ResourceResponseDto,
  CreateUserRequestDto,
  CreateCourseRequestDto,
  CreateResourceRequestDto,
  UserInfoCriteria,
  CourseCriteria,
  ResourceCriteria
} from '../generated';

export class Endo4LifeApiImpl extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
  }

  // User APIs
  async getUsers(criteria?: UserInfoCriteria, page?: number, size?: number) {
    const config = await this.getApiConfiguration();
    const userApi = new UserV1Api(config);
    return userApi.getUsers({ criteria, pageable: { page, size } });
  }

  async getCurrentUser() {
    const config = await this.getApiConfiguration();
    const userApi = new UserV1Api(config);
    return userApi.getCurrentUserInfo();
  }

  async createUser(data: CreateUserRequestDto, avatar?: File, certificates?: File[]) {
    const config = await this.getApiConfiguration();
    const userApi = new UserV1Api(config);
    return userApi.createUser({ user: data, avatar, certificate: certificates });
  }

  async getUserById(id: string) {
    const config = await this.getApiConfiguration();
    const userApi = new UserV1Api(config);
    return userApi.getUserById({ id });
  }

  async inviteUser(data: any) {
    const config = await this.getApiConfiguration();
    const userApi = new UserV1Api(config);
    return userApi.inviteUser({ inviteUserRequestDto: data });
  }

  // Course APIs
  async getCourses(criteria?: CourseCriteria, page?: number, size?: number) {
    const config = await this.getApiConfiguration();
    const courseApi = new CourseV1Api(config);
    return courseApi.getCourses({ criteria, pageable: { page, size } });
  }

  async createCourse(data: CreateCourseRequestDto) {
    const config = await this.getApiConfiguration();
    const courseApi = new CourseV1Api(config);
    return courseApi.createCourse({ createCourseRequestDto: data });
  }

  async getCourseById(id: string) {
    const config = await this.getApiConfiguration();
    const courseApi = new CourseV1Api(config);
    return courseApi.getCourseById({ id });
  }

  // Resource APIs
  async getResources(criteria?: ResourceCriteria, page?: number, size?: number) {
    const config = await this.getApiConfiguration();
    const resourceApi = new ResourceV1Api(config);
    return resourceApi.getResources({ criteria, pageable: { page, size } });
  }

  async createResource(data: CreateResourceRequestDto) {
    const config = await this.getApiConfiguration();
    const resourceApi = new ResourceV1Api(config);
    return resourceApi.createResource({ createResourceRequestDto: data });
  }

  async getResourceById(id: string) {
    const config = await this.getApiConfiguration();
    const resourceApi = new ResourceV1Api(config);
    return resourceApi.getResourceById({ id });
  }
}

// Create singleton instance
export const endo4lifeApi = new Endo4LifeApiImpl();
