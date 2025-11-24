import { BaseApi, ResourceV1Api, MinioV1Api, ResourceType } from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import { IPaginatedResponse, IResponse } from '@endo4life/types';
import { IBookEntity, ICreateBookRequest, IUpdateBookRequest, IBookFilter } from '../types';

export interface IBookApi {
  getBooks(filter: IBookFilter): Promise<IPaginatedResponse<IBookEntity>>;
  getBookById(id: string): Promise<IResponse<IBookEntity>>;
  createBook(request: ICreateBookRequest, onProgress?: (progress: number) => void): Promise<string[]>;
  updateBook(id: string, request: IUpdateBookRequest): Promise<void>;
  deleteBook(id: string): Promise<void>;
  deleteBooks(ids: string[]): Promise<void>;
}

export class BookApiImpl extends BaseApi implements IBookApi {
  private resourceApi: ResourceV1Api | null = null;

  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  private async getResourceApi(): Promise<ResourceV1Api> {
    if (!this.resourceApi) {
      const config = await this.getApiConfiguration();
      this.resourceApi = new ResourceV1Api(config);
    }
    return this.resourceApi;
  }

  async getBooks(filter: IBookFilter): Promise<IPaginatedResponse<IBookEntity>> {
    const api = await this.getResourceApi();
    
    const criteria = {
      type: ResourceType.Book,
      title: filter.title,
      state: filter.state,
      createdBy: filter.createdBy,
      tag: filter.tag
    };

    const pageable = {
      page: filter.page ?? 0,
      size: filter.size ?? 20,
      sort: filter.sort ? [filter.sort] : ['createdAt,desc']
    };

    const response = await api.getResources({ criteria, pageable });
    
    // Filter chỉ lấy resources có type = BOOK (đảm bảo an toàn)
    const bookData = (response.data.data || []).filter(
      (resource: any) => resource.type === ResourceType.Book || resource.type === 'OTHER'
    ) as IBookEntity[];
    
    return {
      data: bookData,
      pagination: {
        page: filter.page ?? 0,
        size: filter.size ?? 20,
        totalCount: bookData.length // Sử dụng số lượng đã filter
      }
    };
  }

  async getBookById(id: string): Promise<IResponse<IBookEntity>> {
    const api = await this.getResourceApi();
    const response = await api.getResourceById({ id });
    
    return {
      data: response.data as IBookEntity
    };
  }

  async createBook(request: ICreateBookRequest, onProgress?: (progress: number) => void): Promise<string[]> {
    const config = await this.getApiConfiguration();
    const minioApi = new MinioV1Api(config);
    const api = await this.getResourceApi();
    
    try {
      // Step 1: Get presigned URL for book file
      onProgress?.(10);
      const bookPresignedResponse = await minioApi.generatePreSignedUrls({
        generatePreSignedUrlDto: {
          resourceType: ResourceType.Book as any,
          numberOfUrls: 1
        }
      });

      if (!bookPresignedResponse.data || bookPresignedResponse.data.length === 0) {
        throw new Error('Failed to generate presigned URL for book file');
      }

      onProgress?.(20);
      
      // Upload book file with progress tracking
      const bookUploadUrl = bookPresignedResponse.data[0];
      const bookObjectKey = this.extractObjectKeyFromUrl(bookUploadUrl);
      
      console.log('Uploading book file to:', bookUploadUrl);
      console.log('Book object key:', bookObjectKey);
      
      await this.uploadFileWithProgress(bookUploadUrl, request.file, (progress) => {
        onProgress?.(20 + progress * 0.5); // 20-70%
      });

      onProgress?.(70);

      // Step 2: Upload thumbnail if provided
      let thumbnailObjectKey: string | undefined;
      if (request.thumbnail) {
        const thumbnailPresignedResponse = await minioApi.generatePreSignedUrls({
          generatePreSignedUrlDto: {
            resourceType: 'THUMBNAIL' as any,
            numberOfUrls: 1
          }
        });

        if (thumbnailPresignedResponse.data && thumbnailPresignedResponse.data.length > 0) {
          const thumbnailUploadUrl = thumbnailPresignedResponse.data[0];
          thumbnailObjectKey = this.extractObjectKeyFromUrl(thumbnailUploadUrl);
          
          console.log('Uploading thumbnail to:', thumbnailUploadUrl);
          console.log('Thumbnail object key:', thumbnailObjectKey);
          
          await this.uploadFileWithProgress(thumbnailUploadUrl, request.thumbnail, (progress) => {
            onProgress?.(70 + progress * 0.2); // 70-90%
          });
        }
      }

      onProgress?.(90);

      // Step 3: Create resource record
      const metadata: any = {
        objectKey: bookObjectKey,
        title: request.title,
        description: request.description || '',
        state: request.state,
        tag: request.tag,
        detailTag: request.detailTag,
      };

      // Add optional fields only if they have values
      if (thumbnailObjectKey) {
        metadata.thumbnail = thumbnailObjectKey;
      }
      if (request.author) {
        metadata.author = request.author;
      }
      if (request.publisher) {
        metadata.publisher = request.publisher;
      }
      if (request.publishYear) {
        metadata.publishYear = request.publishYear;
      }
      if (request.isbn) {
        metadata.isbn = request.isbn;
      }

      console.log('Creating resource with metadata:', metadata);

      const response = await api.createResource({
        createResourceRequest: {
          type: ResourceType.Book as any,
          metadata: [metadata]
        }
      });

      onProgress?.(100);

      return response.data as string[];
    } catch (error: any) {
      console.error('Error creating book:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }

  private extractObjectKeyFromUrl(presignedUrl: string): string {
    try {
      // Extract the object key from the presigned URL
      // Format: https://minio-url/bucket/objectKey?signature...
      const url = new URL(presignedUrl);
      const pathParts = url.pathname.split('/').filter(p => p);
      
      // The objectKey is everything after the bucket name
      // Usually format is: /bucket-name/uuid-objectkey
      if (pathParts.length >= 2) {
        // Return everything after the first part (bucket name)
        return pathParts.slice(1).join('/');
      }
      
      // Fallback: return the last part
      return pathParts[pathParts.length - 1] || presignedUrl;
    } catch (error) {
      console.error('Error extracting object key from URL:', error);
      // Fallback: try to extract from the path directly
      const match = presignedUrl.match(/\/([^\/\?]+)\?/);
      return match ? match[1] : presignedUrl;
    }
  }

  private async uploadFileWithProgress(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress?.(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }

  async updateBook(id: string, request: IUpdateBookRequest): Promise<void> {
    const api = await this.getResourceApi();
    await api.updateResource({
      id,
      updateResourceRequestDto: {
        title: request.title,
        description: request.description,
        state: request.state as any,
        tag: request.tag,
        detailTag: request.detailTag,
        author: request.author,
        publisher: request.publisher,
        publishYear: request.publishYear,
        isbn: request.isbn
      }
    });
  }

  async deleteBook(id: string): Promise<void> {
    const api = await this.getResourceApi();
    await api.deleteResource({ id });
  }

  async deleteBooks(ids: string[]): Promise<void> {
    const api = await this.getResourceApi();
    await api.deleteResources({ id: ids as any });
  }
}

// Export singleton instance
export const bookApi = new BookApiImpl();

