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
  importFileImage(data: IImageCreateFormData): Promise<void>;
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

    // 2) Upload files to presigned URLs
    const uploadedMeta: CreateResourceRequestDto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File;
      const uploadUrl = presignedUrls[i];
      console.log('[createImage] uploading', file.name, 'to', uploadUrl);

      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        body: file, // do not add custom headers unless backend signed them
      });

      let respText = '';
      try { respText = await putResp.text(); } catch (e) { /* ignore */ }
      console.log('[createImage] PUT status', putResp.status, respText);

      if (!putResp.ok) {
        throw new Error(`Upload failed for ${file.name}: ${putResp.status} ${respText}`);
      }

      // 3) derive objectKey from presigned url
      let objectKey: string | undefined;
      try {
        const urlObj = new URL(uploadUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        // assume /{bucket}/{objectKey...}
        objectKey = decodeURIComponent(pathSegments.slice(1).join('/'));
      } catch (e) {
        console.warn('[createImage] cannot parse objectKey from url', e);
      }

      const meta = (data.metadata && data.metadata[i]) || (data.metadata && data.metadata[0]) || {};
      uploadedMeta.push({
        objectKey,
        title: meta.title ?? file.name,
        description: meta.description,
        state: meta.state,
        tag: meta.tag,
        detailTag: meta.detailTag,
      });
    }

    // 4) create resource records on backend
    console.log('[createImage] createResource payload metadata=', uploadedMeta);
    const resourceApi = new ResourceV1Api(config);
    const createReq: CreateResourceRequest = {
      type: UploadType.Image,
      metadata: uploadedMeta,
    };

    try {
      // generator usually expects wrapper { createResourceRequest }
      // @ts-ignore
      const resp = await (resourceApi as any).createResource({ createResourceRequest: createReq });
      console.log('[createImage] createResource done', resp);
    } catch (err) {
      console.error('[createImage] createResource failed', err);
      throw err;
    }
  }

  async importFileImage(data: IImageCreateFormData): Promise<void> {
    const config = await this.getApiConfiguration();
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
    const file = (data as any).file as File | undefined;
    const config = await this.getApiConfiguration();
    const api = new ResourceV1Api(config);

    // If no new file provided, call update normally
    if (!file) {
      const updateReq = ImageMapper.getInstance().toUpdateResourceRequest(data);
      console.log('[image-api] updateImage -> no file, updateReq=', updateReq);
      try {
        // try direct call first
        // @ts-ignore
        const respDirect = await api.updateResource(updateReq);
        console.log('[image-api] updateResource direct resp=', respDirect);
        return;
      } catch (errDirect) {
        console.warn('[image-api] updateResource direct failed, try wrapper', errDirect);
        try {
          // @ts-ignore
          const respWrap = await (api as any).updateResource({ updateResourceRequest: updateReq });
          console.log('[image-api] updateResource wrapper resp=', respWrap);
          return;
        } catch (errWrap) {
          console.error('[image-api] updateResource failed (both ways)', errWrap);
          throw errWrap;
        }
      }
    }

    // 1) Request one presigned URL
    const dto: GeneratePreSignedUrlDto = {
      resourceType: (ResourceType as any)?.Image ?? 'IMAGE',
      numberOfUrls: 1,
    };
    console.log('[image-api] requesting presigned url dto=', dto);
    const presignedUrls = await this.generatePreSignedUrls(dto);
    console.log('[image-api] presignedUrls=', presignedUrls);

    if (!Array.isArray(presignedUrls) || presignedUrls.length < 1) {
      throw new Error('No presigned URL returned from server');
    }

    // 2) Upload the file to presigned URL
    const uploadUrl = presignedUrls[0];
    console.log('[image-api] uploading', file.name, 'to', uploadUrl);

    const putResp = await fetch(uploadUrl, {
      method: 'PUT',
      body: file, // avoid custom headers unless signed
    });

    let respText = '';
    try { respText = await putResp.text(); } catch (e) { /* ignore */ }
    console.log('[image-api] PUT status', putResp.status, respText);

    if (!putResp.ok) {
      console.error('[image-api] PUT failed', { status: putResp.status, text: respText });
      throw new Error(`Upload failed for ${file.name}: ${putResp.status} ${respText}`);
    }

    // 3) derive objectKey from presigned url and attach to metadata (single metadata object)
    let objectKey: string | undefined;
    try {
      const urlObj = new URL(uploadUrl);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      objectKey = decodeURIComponent(pathSegments.slice(1).join('/')); // omit bucket
    } catch (e) {
      console.warn('[image-api] cannot parse objectKey from url', e);
    }

    if (!data.metadata) data.metadata = {} as any;
    (data.metadata as any).objectKey = objectKey;
    console.log('[image-api] attached objectKey to metadata', objectKey);

    // 4) Call backend update
    const updateReq = ImageMapper.getInstance().toUpdateResourceRequest(data);
    console.log('[image-api] updateResource payload=', updateReq);

    try {
      // try direct
      // @ts-ignore
      const resp = await api.updateResource(updateReq);
      console.log('[image-api] updateResource direct resp=', resp);
    } catch (err) {
      console.warn('[image-api] updateResource direct failed, trying wrapper', err);
      try {
        // @ts-ignore
        const resp2 = await (api as any).updateResource({ updateResourceRequest: updateReq });
        console.log('[image-api] updateResource wrapper resp=', resp2);
      } catch (err2) {
        console.error('[image-api] updateResource failed (both ways)', err2);
        throw err2;
      }
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
