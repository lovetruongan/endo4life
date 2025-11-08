import {
  ResourceDetailResponseDto,
  ResourceResponseDto,
  ResourceState,
  ResourceV1ApiCreateResourceRequest,
  ResourceV1ApiUpdateResourceRequest,
  UpdateResourceRequestDto,
  UploadType,
} from '@endo4life/data-access';
import { IImageEntity } from './image-entity';
import {
  IImageCreateFormData,
  IImageFormMetadataData,
  IImageUpdateFormData,
} from './image-form-data';
import { IOption } from '@endo4life/types';
import { isFileValid } from '@endo4life/util-common';
import { isEqual } from 'lodash';

export interface IImageMapper {
  fromDto(dto: ResourceResponseDto): IImageEntity;
  toCreateFormData(entity: IImageEntity): IImageCreateFormData;
  toUpdateFormData(entity: IImageEntity): IImageUpdateFormData;
  toCreateImageRequest(
    data: IImageCreateFormData,
    tagOptions?: IOption[]
  ): IImageCreateFormData;
  toUpdateImageRequest(
    data: IImageUpdateFormData,
    tagOptions?: IOption[]
  ): IImageUpdateFormData;
  toCreateResourceRequest(
    data: IImageCreateFormData
  ): ResourceV1ApiCreateResourceRequest;
  toUpdateResourceRequest(
    data: IImageUpdateFormData
  ): UpdateResourceRequestDto;
}

export class ImageMapper implements IImageMapper {
  private static _instance: ImageMapper | null = null;
  static getInstance(): ImageMapper {
    if (!this._instance) {
      this._instance = new ImageMapper();
    }
    return this._instance;
  }

  fromDto(dto: ResourceResponseDto): IImageEntity {
    if (!dto.id) throw new Error('Invalid Image DTO');
    return {
      id: dto.id,
      title: dto.title,
      state: dto.state,
      thumbnailUrl: dto.thumbnailUrl,
      commentCount: dto.commentCount,
      viewNumber: dto.viewNumber,
      createdAt: dto.createdAt,
      tag: dto.tag || [],
      detailTag: dto.detailTag || [],
      metadata: dto,
    };
  }

  fromDetailDto(dto: ResourceDetailResponseDto): IImageEntity {
    if (!dto.id) throw new Error('Invalid User DTO');
    return {
      id: dto.id,
      title: dto.title,
      state: dto.state,
      resourceUrl: dto.resourceUrl,
      dimension: dto.dimension,
      description: dto.description,
      size: dto.size,
      extension: dto.extension,
      time: dto.time,
      createdAt: dto.createdAt,
      tag: dto.tag,
      detailTag: dto.detailTag,
      metadata: dto,
    };
  }

  toCreateFormData(entity: IImageEntity): IImageCreateFormData {
    return {
      type: UploadType.Multiple,
      files: [],
      metadata: [
        {
          title: entity.title || '',
          description: entity.description || '',
          state: entity.state,
          tag: entity.tag,
          detailTag: entity.detailTag,
        },
      ],
      compressedFile: {} as File,
    };
  }

  toUpdateFormData(entity: IImageEntity): IImageUpdateFormData {
    return {
      id: entity.id,
      resourceUrl: entity.resourceUrl,
      // file: {} as File,
      metadata: {
        title: entity.title || '',
        description: entity.description || '',
        tag: entity.tag,
        detailTag: entity.detailTag,
        state: entity.state,
      },
      entity: entity,
    };
  }

  toPartialUpdateFormData(
    form: IImageUpdateFormData,
    rawData: IImageEntity
  ): IImageUpdateFormData {
    const partialFormData = {} as IImageUpdateFormData;
    partialFormData['metadata'] = {} as IImageFormMetadataData;

    partialFormData['id'] = form.id;
    if (isFileValid(form.file)) partialFormData['file'] = form.file;
    if (form.metadata.title !== rawData.title)
      partialFormData['metadata']['title'] = form.metadata.title;
    if (form.metadata.description !== rawData.description)
      partialFormData['metadata']['description'] = form.metadata.description;
    if (form.metadata.state !== rawData.state)
      partialFormData['metadata']['state'] = form.metadata.state;
    if (!isEqual(form.metadata.tag, rawData.tag))
      partialFormData['metadata']['tag'] = form.metadata.tag;
    if (!isEqual(form.metadata.detailTag, rawData.detailTag))
      partialFormData['metadata']['detailTag'] = form.metadata.detailTag;

    return partialFormData;
  }

  toCreateImageRequest(
    form: IImageCreateFormData,
    tagOptions?: IOption[]
  ): IImageCreateFormData {
    if (tagOptions && tagOptions.length) {
      form.metadata?.forEach((item) => {
        const parentTagIds = item.tag;
        const detailTagIds = item.detailTag;
        item.tag = parentTagIds?.map(
          (id) =>
            tagOptions.find((t) => t.value === id)?.label ||
            'Nhãn dán không hợp lệ'
        );
        item.detailTag = detailTagIds?.map(
          (id) =>
            tagOptions.find((t) => t.value === id)?.label ||
            'Nhãn dán không hợp lệ'
        );
      });
    }
    return {
      type: form.type,
      files: form.files,
      metadata: form.metadata,
      compressedFile: form.compressedFile,
    };
  }

  toUpdateImageRequest(
    data: IImageUpdateFormData,
    tagOptions?: IOption[]
  ): IImageUpdateFormData {
    if (!data.id) throw new Error('Invalid id');
    if (tagOptions && tagOptions.length) {
      const parentTagIds = data.metadata.tag;
      const detailTagIds = data.metadata.detailTag;
      data.metadata.tag = parentTagIds?.map(
        (id) =>
          tagOptions.find((t) => t.value === id)?.label ||
          'Nhãn dán không hợp lệ'
      );
      data.metadata.detailTag = detailTagIds?.map(
        (id) =>
          tagOptions.find((t) => t.value === id)?.label ||
          'Nhãn dán không hợp lệ'
      );
    }
    return {
      id: data.id,
      metadata: data.metadata,
      file: data.file,
    };
  }

  toCreateResourceRequest(
    data: IImageCreateFormData
  ): ResourceV1ApiCreateResourceRequest {
    return {
      type: UploadType.Multiple,
      files: data?.files,
      metadata: [
        {
          title: data?.metadata[0]?.title,
          description: data?.metadata[0]?.description || '',
          state: data?.metadata[0]?.state,
          tag: data?.metadata[0]?.tag,
          detailTag: data?.metadata[0]?.detailTag,
        },
      ],
      compressedFile: data.compressedFile,
    };
  }

  toUploadResourceRequest(
    data: IImageCreateFormData
  ): ResourceV1ApiCreateResourceRequest {
    // Note: ZIP/Compressed imports are now handled directly in image-api.ts
    // by uploading to MinIO PROCESS bucket. This method is only used for
    // non-ZIP bulk imports (IMAGE/VIDEO types with multiple files)
    return {
      type: data.type,
      files: data.files || [],
      metadata:
        data.files?.map((file, index) => ({
          title: data?.metadata[index]?.title || '',
          description: data?.metadata[index]?.description || '',
          state: data?.metadata[index]?.state || ResourceState.Unlisted,
          tag: data?.metadata[index]?.tag || [],
          detailTag: data?.metadata[index]?.detailTag || [],
        })) || [],
    };
  }

  toUpdateResourceRequest(
    data: IImageUpdateFormData
  ): UpdateResourceRequestDto {
    const payload: UpdateResourceRequestDto = {
      title: data.metadata.title,
      description: data.metadata.description,
      state: data.metadata.state,
      tag: data.metadata.tag,
      detailTag: data.metadata.detailTag,
    };

    // If a new file was uploaded, include the attachment field (objectKey)
    if ((data as any).fileKey) {
      payload.attachment = (data as any).fileKey;
    }

    return payload;
  }
}
