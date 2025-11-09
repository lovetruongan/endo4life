import {
  BaseApi,
  MinioV1Api,
  GeneratePreSignedUrlDto,
  ResourceV1Api,
  CreateResourceRequest,
  CreateResourceRequestDto,
  UploadType,
  ResourceType,
} from '@endo4life/data-access';
import {
  IFilter,
  IPaginatedResponse,
  IResponse,
} from '@endo4life/types';
import { EnvConfig } from '@endo4life/feature-config';
import { DEFAULT_PAGINATION } from '../constants';
import {
  IImageCreateFormData,
  IImageEntity,
  ImageFilter,
  ImageMapper,
  IImageUpdateFormData,
} from '../types';

export interface IImageApi {
  getImages(filter: IFilter): Promise<IPaginatedResponse<IImageEntity>>;
  updateImage(data: IImageUpdateFormData): Promise<void>;
  createImage(data: IImageCreateFormData): Promise<void>;
  deleteImage(id: string): Promise<void>;
  deleteImages(ids: string[]): Promise<void>;
  importFileImage(data: IImageCreateFormData, sessionId?: string): Promise<void>;
  getImageById(imageId: string): Promise<IResponse<IImageEntity>>;
}

export class ImageApiImpl extends BaseApi implements IImageApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }
  // optional helper: expose wrapper if you want to call Minio directly from this API
  async generatePreSignedUrls(dto: GeneratePreSignedUrlDto): Promise<string[]> {
    const config = await this.getApiConfiguration();
    const minioApi = new MinioV1Api(config);
    const resp = await minioApi.generatePreSignedUrls({ generatePreSignedUrlDto: dto });
    return resp?.data ?? [];
  }

  async getImages(filter: IFilter): Promise<IPaginatedResponse<IImageEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const imageFilter = new ImageFilter(filter);
    const criteria = imageFilter.toCriteria();
    const pageable = imageFilter.toPageable();
    const response = await api.getResources({ criteria, pageable });
    return {
      data: response.data.data?.map(ImageMapper.getInstance().fromDto),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async getImageById(imageId: string): Promise<IResponse<IImageEntity>> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    const response = await api.getResourceById({ id: imageId });
    return {
      data: ImageMapper.getInstance().fromDetailDto(response.data),
    };
  }

  // async createImage(data: IImageCreateFormData): Promise<void> {
  //   const config = await this.getApiConfiguration();
  //   const api = new ResourceV1Api(config);
  //   await api.createResource(ImageMapper.getInstance().toCreateResourceRequest(data));
  //   return;
  // }
  // ...existing code...
  // async importFileImage(data: IImageCreateFormData): Promise<void> {
  //   const files = data.files ?? [];
  //   if (!files || files.length === 0) {
  //     // nếu không có file, fallback gọi createImage (chỉ metadata)
  //     return this.createImage(data);
  //   }

  //   const config = await this.getApiConfiguration();
  //   const minioApi = new MinioV1Api(config);

  //   // 1️⃣ Gọi API để lấy presigned URLs (List<String>)
  //   const dto: GeneratePreSignedUrlDto = {
  //     resourceType: (ResourceType as any)?.Image ?? 'IMAGE',
  //     numberOfUrls: files.length,
  //   };
  //   console.log('[import] requesting presigned urls dto=', dto);

  //   const presignedResp = await minioApi.generatePreSignedUrls({ generatePreSignedUrlDto: dto });
  //   const presignedUrls: string[] = presignedResp?.data ?? [];
  //   console.log('[import] presigned response raw =', presignedUrls);

  //   if (!Array.isArray(presignedUrls) || presignedUrls.length < files.length) {
  //     throw new Error('Not enough presigned URLs returned');
  //   }

  //   // 2️⃣ Upload từng file lên URL tương ứng
  //   const uploadedMeta: CreateResourceRequestDto[] = [];

  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i] as File;
  //     const uploadUrl = presignedUrls[i];

  //     console.log('[import] uploading', file.name, 'to', uploadUrl);

  //     const putResp = await fetch(uploadUrl, {
  //       method: 'PUT',
  //       body: file,
  //     });

  //     if (!putResp.ok) {
  //       let respText = '';
  //       try { respText = await putResp.text(); } catch (e) { }
  //       console.error('[import] PUT failed', respText);
  //       throw new Error(`Upload failed for ${file.name}: ${putResp.status} ${respText}`);
  //     }

  //     // 3️⃣ Lấy objectKey từ URL (vì backend không trả riêng)
  //     let objectKey: string | undefined = undefined;
  //     try {
  //       const urlObj = new URL(uploadUrl);
  //       const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  //       objectKey = decodeURIComponent(pathSegments.slice(1).join('/')); // bỏ bucket
  //     } catch (e) {
  //       console.warn('[import] cannot parse objectKey from url', e);
  //     }

  //     console.log('[import] derived objectKey=', objectKey);

  //     const meta = (data.metadata && data.metadata[i]) || (data.metadata && data.metadata[0]) || {};
  //     uploadedMeta.push({
  //       objectKey,
  //       title: meta.title ?? file.name,
  //       description: meta.description,
  //       state: meta.state,
  //       tag: meta.tag,
  //       detailTag: meta.detailTag,
  //     });
  //   }

  //   // 4️⃣ Gửi metadata về backend
  //   console.log('[import] createResource payload metadata=', uploadedMeta);
  //   const resourceApi = new ResourceV1Api(config);
  //   const createReq: CreateResourceRequest = {
  //     type: UploadType.Image,
  //     metadata: uploadedMeta,
  //   };

  //   try {
  //     // @ts-ignore vì generator có thể yêu cầu param wrapper
  //     const resp = await (resourceApi as any).createResource({ createResourceRequest: createReq });
  //     console.log('[import] createResource done, resp=', resp);
  //   } catch (err) {
  //     console.error('[import] createResource failed', err);
  //     throw err;
  //   }
  // }



  async createImage(data: IImageCreateFormData): Promise<void> {
    const files = data.files ?? [];

    const config = await this.getApiConfiguration();

    // If no files, just create resource records from metadata
    if (!files || files.length === 0) {
      const resourceApi = new ResourceV1Api(config);
      const createReq: CreateResourceRequest = {
        type: UploadType.Image,
        metadata: (data.metadata || []).map((m) => ({
          objectKey: (m as any)?.objectKey,
          title: m.title ?? '',
          description: m.description,
          state: m.state,
          tag: m.tag,
          detailTag: m.detailTag,
        })),
      };

      // generator may expect wrapper object
      // @ts-ignore
      await (resourceApi as any).createResource({ createResourceRequest: createReq });
      return;
    }

    // 1) Request presigned URLs
    const dto: GeneratePreSignedUrlDto = {
      resourceType: (ResourceType as any)?.Image ?? 'IMAGE',
      numberOfUrls: files.length,
    };
    console.log('[createImage] requesting presigned urls dto=', dto);
    const presignedUrls = await this.generatePreSignedUrls(dto);
    console.log('[createImage] presignedUrls=', presignedUrls);

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
        console.warn('[createImage] cannot parse objectKey from url', e);
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
    console.log('[createImage] createResource payload metadata=', preparedMeta);
    const resourceApi = new ResourceV1Api(config);
    const createReq: CreateResourceRequest = {
      type: UploadType.Image,
      metadata: preparedMeta,
    };

    try {
      // @ts-ignore
      const resp = await (resourceApi as any).createResource({ createResourceRequest: createReq });
      console.log('[createImage] createResource done', resp);
    } catch (err) {
      console.error('[createImage] createResource failed', err);
      throw err;
    }

    // 4) NOW upload files (webhook will find existing resources and link thumbnails)
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File;
      const uploadUrl = presignedUrls[i];
      console.log('[createImage] uploading', file.name, 'to', uploadUrl);

      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      });

      let respText = '';
      try { respText = await putResp.text(); } catch (e) { /* ignore */ }
      console.log('[createImage] PUT status', putResp.status, respText);

      if (!putResp.ok) {
        throw new Error(`Upload failed for ${file.name}: ${putResp.status} ${respText}`);
      }
    }
  }

  async importFileImage(data: IImageCreateFormData, sessionId?: string): Promise<void> {
    const config = await this.getApiConfiguration();
    
    // For ZIP files, upload directly to MinIO PROCESS bucket
    // The webhook will automatically extract and create resources
    if (data.type === UploadType.Compressed && data.compressedFile) {
      const minioApi = new MinioV1Api(config);
      
      // Get presigned URL for PROCESS bucket
      const presignedUrls = await minioApi.generatePreSignedUrls({
        resourceType: ResourceType.Process,
        numberOfUrls: 1,
      });
      
      if (!presignedUrls || presignedUrls.length === 0) {
        throw new Error('Failed to generate presigned URL');
      }
      
      // Rename file to include session ID: sessionId_originalName.zip
      // This allows the backend to send progress updates to the correct WebSocket topic
      let fileToUpload = data.compressedFile;
      if (sessionId) {
        const originalName = data.compressedFile.name;
        const newName = `${sessionId}_${originalName}`;
        fileToUpload = new File([data.compressedFile], newName, {
          type: data.compressedFile.type,
        });
      }
      
      // Upload ZIP directly to MinIO
      const response = await fetch(presignedUrls[0], {
        method: 'PUT',
        body: fileToUpload,
        headers: {
          'Content-Type': 'application/zip',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      
      return;
    }
    
    // For non-ZIP imports, use the regular createResource flow
    const api = new ResourceV1Api(config);
    await api.createResource(ImageMapper.getInstance().toUploadResourceRequest(data));
    return;
  }



  // async updateImage(data: IImageUpdateFormData): Promise<void> {
  //   const config = await this.getApiConfiguration();
  //   const api = new ResourceV1Api(config);
  //   await api.updateResource(ImageMapper.getInstance().toUpdateResourceRequest(data));
  //   return;
  // }
  async updateImage(data: IImageUpdateFormData): Promise<void> {
    console.log('[image-api] updateImage called', { id: (data as any)?.id, hasFile: !!(data as any)?.file });

    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);

    let uploadedFileKey: string | undefined;

    // 1) Nếu có file mới -> lấy presigned url từ MinioV1Api (qua helper) và upload
    // Check if file is a valid File object with content (not just empty object)
    const hasNewFile = data.file && data.file instanceof File && data.file.size > 0;
    if (hasNewFile) {
      const dto: GeneratePreSignedUrlDto = {
        resourceType: (data as any).resourceType ?? (ResourceType as any)?.Image ?? 'IMAGE',
        numberOfUrls: 1,
      };
      console.log('[image-api] requesting presigned url dto=', dto);

      const presignedUrls = await this.generatePreSignedUrls(dto);
      console.log('[image-api] presignedUrls=', presignedUrls);

      if (!Array.isArray(presignedUrls) || presignedUrls.length < 1) {
        throw new Error('No presigned URL returned from server');
      }

      const uploadUrl = presignedUrls[0];
      console.log('[image-api] uploading', (data.file as File).name, 'to', uploadUrl);

      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        body: data.file as File, // avoid custom headers unless server signed them
      });

      let respText = '';
      try { respText = await putResp.text(); } catch (e) { /* ignore */ }
      console.log('[image-api] PUT status', putResp.status, respText);

      if (!putResp.ok) {
        throw new Error(`Upload failed for ${(data.file as File).name}: ${putResp.status} ${respText}`);
      }

      // derive objectKey from presigned url
      try {
        const urlObj = new URL(uploadUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        uploadedFileKey = decodeURIComponent(pathSegments.slice(1).join('/')); // drop bucket
      } catch (e) {
        console.warn('[image-api] cannot parse objectKey from url', e);
      }

      console.log('[image-api] uploadedFileKey=', uploadedFileKey);
    }

    // 2) Build update payload (mapper should return UpdateResourceRequestDto shape)
    const updatePayload = ImageMapper.getInstance().toUpdateResourceRequest({
      ...data,
      ...(uploadedFileKey ? { fileKey: uploadedFileKey } : {}),
    });

    console.log('[image-api] mapped updatePayload=', updatePayload);

    // 3) Call backend update API - MUST pass resource id as path param
    const resourceId = (data as any).id;
    if (!resourceId) {
      throw new Error('Missing resource id for update');
    }

    try {
      // Try wrapper param style first (generated clients often expect { id, updateResourceRequestDto })
      // @ts-ignore
      const resp = await (api as any).updateResource({ id: resourceId, updateResourceRequestDto: updatePayload });
      console.log('[image-api] updateResource wrapper resp=', resp);
    } catch (errWrapper) {
      console.warn('[image-api] wrapper update failed, try direct call', errWrapper);
      try {
        // direct call style: api.updateResource(id, body)
        // @ts-ignore
        const respDirect = await api.updateResource(resourceId, updatePayload);
        console.log('[image-api] updateResource direct resp=', respDirect);
      } catch (errDirect) {
        console.error('[image-api] updateResource failed (both attempts)', errDirect);
        throw errDirect;
      }
    }

    // optional: verify by fetching updated resource (helps debug)
    try {
      // @ts-ignore
      const verify = await api.getResourceById({ id: resourceId });
      console.log('[image-api] verify getResourceById after update =', verify?.data);
    } catch (e) {
      console.warn('[image-api] verify fetch failed', e);
    }
    return;
  }

  async deleteImage(id: string): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResource({ id });
    return;
  }

  async deleteImages(ids: string[]): Promise<void> {
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);
    await api.deleteResources({ id: ids });
    return;
  }
}
