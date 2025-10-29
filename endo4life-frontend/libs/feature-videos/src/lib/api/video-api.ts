import { 
  BaseApi, 
  ResourceV1Api, 
  MinioV1Api, 
  GeneratePreSignedUrlDto, 
  ResourceType,
  CreateResourceRequestDto,
  CreateResourceRequest,
  UploadType,
} from '@endo4life/data-access';
import {
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { EnvConfig } from '@endo4life/feature-config';
import { DEFAULT_PAGINATION } from '../constants';
import {
  IVideoCreateFormData,
  IVideoEntity,
  VideoFilter,
  VideoMapper,
  IVideoUpdateFormData,
} from '../types';

export interface IVideoApi {
  getVideos(filter: IFilter): Promise<IPaginatedResponse<IVideoEntity>>;
  updateVideo(data: IVideoUpdateFormData): Promise<void>;
  createVideo(data: IVideoCreateFormData): Promise<void>;
  importFileVideo(data: IVideoCreateFormData): Promise<void>;
  getVideoById(videoId: string): Promise<IResponse<IVideoEntity>>;
}

export class VideoApiImpl extends BaseApi implements IVideoApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  // Helper method to generate presigned URLs
  async generatePreSignedUrls(dto: GeneratePreSignedUrlDto): Promise<string[]> {
    const config = await this.getApiConfiguration();
    const minioApi = new MinioV1Api(config);
    const resp = await minioApi.generatePreSignedUrls({ generatePreSignedUrlDto: dto });
    return resp?.data ?? [];
  }

  async getVideos(filter: IFilter): Promise<IPaginatedResponse<IVideoEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const videoFilter = new VideoFilter(filter);
    const criteria = videoFilter.toCriteria();
    const pageable = videoFilter.toPageable();
    const response = await api.getResources({ criteria, pageable });
    const videoMapper = new VideoMapper();
    return {
      data: response.data.data?.map(videoMapper.fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getVideoById(videoId: string): Promise<IResponse<IVideoEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const response = await api.getResourceById({ id: videoId });
    const videoMapper = new VideoMapper();
    return {
      data: videoMapper.fromDetailDto(response.data),
    };
  }

  async createVideo(data: IVideoCreateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const videoMapper = new VideoMapper();
    const files = data.files || [];

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No video files to upload');
    }

    // 1) Request presigned URLs
    const dto: GeneratePreSignedUrlDto = {
      resourceType: (ResourceType as any)?.Video ?? 'VIDEO',
      numberOfUrls: files.length,
    };
    console.log('[createVideo] requesting presigned urls dto=', dto);
    const presignedUrls = await this.generatePreSignedUrls(dto);
    console.log('[createVideo] presignedUrls=', presignedUrls);

    if (!Array.isArray(presignedUrls) || presignedUrls.length < files.length) {
      throw new Error('Not enough presigned URLs returned from server');
    }

    // 2) Extract objectKeys from presigned URLs and prepare metadata
    const preparedMeta: CreateResourceRequestDto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File;
      const uploadUrl = presignedUrls[i];

      // derive objectKey from presigned url
      let objectKey: string | undefined;
      try {
        const urlObj = new URL(uploadUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        objectKey = decodeURIComponent(pathSegments.slice(1).join('/'));
      } catch (e) {
        console.warn('[createVideo] cannot parse objectKey from url', e);
      }

      const meta = (data.metadata && data.metadata[i]) || (data.metadata && data.metadata[0]) || {};
      preparedMeta.push({
        objectKey,
        title: meta.title ?? file.name,
        description: meta.description,
        state: meta.state,
        tag: meta.tag,
        detailTag: meta.detailTag,
      });
    }

    // 3) Create resource records FIRST (before uploading)
    console.log('[createVideo] createResource payload metadata=', preparedMeta);
    const resourceApi = new ResourceV1Api(config);
    const createReq: CreateResourceRequest = {
      type: UploadType.Video,
      metadata: preparedMeta,
    };

    try {
      // @ts-ignore
      const resp = await (resourceApi as any).createResource({ createResourceRequest: createReq });
      console.log('[createVideo] createResource done', resp);
    } catch (err) {
      console.error('[createVideo] createResource failed', err);
      throw err;
    }

    // 4) NOW upload files (webhook will find existing resources and link thumbnails)
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File;
      const uploadUrl = presignedUrls[i];
      console.log('[createVideo] uploading', file.name, 'to', uploadUrl);

      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      });

      let respText = '';
      try { respText = await putResp.text(); } catch (e) { /* ignore */ }
      console.log('[createVideo] PUT status', putResp.status, respText);

      if (!putResp.ok) {
        throw new Error(`Upload failed for ${file.name}: ${putResp.status} ${respText}`);
      }
    }

    console.log('[createVideo] all uploads complete');
    return;
  }

  async importFileVideo(data: IVideoCreateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const videoMapper = new VideoMapper();
    await api.createResource(videoMapper.toUploadResourceRequest(data));
    return;
  }

  async updateVideo(data: IVideoUpdateFormData): Promise<void> {
    console.log('[video-api] updateVideo called', { id: (data as any)?.id, hasFile: !!(data as any)?.file });

    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);

    let uploadedFileKey: string | undefined;

    // 1) If new file -> get presigned url and upload
    // Check if file is a valid File object with content (not just empty object)
    const hasNewFile = data.file && data.file instanceof File && data.file.size > 0;
    if (hasNewFile) {
      const dto: GeneratePreSignedUrlDto = {
        resourceType: (data as any).resourceType ?? (ResourceType as any)?.Video ?? 'VIDEO',
        numberOfUrls: 1,
      };
      console.log('[video-api] requesting presigned url dto=', dto);

      const presignedUrls = await this.generatePreSignedUrls(dto);
      console.log('[video-api] presignedUrls=', presignedUrls);

      if (!Array.isArray(presignedUrls) || presignedUrls.length < 1) {
        throw new Error('No presigned URL returned from server');
      }

      const uploadUrl = presignedUrls[0];
      console.log('[video-api] uploading', (data.file as File).name, 'to', uploadUrl);

      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        body: data.file as File,
      });

      let respText = '';
      try { respText = await putResp.text(); } catch (e) { /* ignore */ }
      console.log('[video-api] PUT status', putResp.status, respText);

      if (!putResp.ok) {
        throw new Error(`Upload failed for ${(data.file as File).name}: ${putResp.status} ${respText}`);
      }

      // derive objectKey from presigned url
      try {
        const urlObj = new URL(uploadUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        uploadedFileKey = decodeURIComponent(pathSegments.slice(1).join('/')); // drop bucket
      } catch (e) {
        console.warn('[video-api] cannot parse objectKey from url', e);
      }

      console.log('[video-api] uploadedFileKey=', uploadedFileKey);
    }

    // 2) Build update payload
    const videoMapper = new VideoMapper();
    const updatePayload = videoMapper.toUpdateResourceRequest({
      ...data,
      ...(uploadedFileKey ? { fileKey: uploadedFileKey } : {}),
    });

    console.log('[video-api] mapped updatePayload=', updatePayload);

    // 3) Call backend update API
    const resourceId = (data as any).id;
    if (!resourceId) {
      throw new Error('Missing resource id for update');
    }

    try {
      // @ts-ignore
      const resp = await (api as any).updateResource({ id: resourceId, updateResourceRequestDto: updatePayload });
      console.log('[video-api] updateResource wrapper resp=', resp);
    } catch (errWrapper) {
      console.warn('[video-api] wrapper update failed, try direct call', errWrapper);
      try {
        // @ts-ignore
        const respDirect = await api.updateResource(resourceId, updatePayload);
        console.log('[video-api] updateResource direct resp=', respDirect);
      } catch (errDirect) {
        console.error('[video-api] updateResource failed (both attempts)', errDirect);
        throw errDirect;
      }
    }

    return;
  }

  async deleteVideo(id: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResource({ id });
    return;
  }

  async deleteVideos(ids: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResources({ id: ids });
    return;
  }
}
