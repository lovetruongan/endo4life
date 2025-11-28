import {
  ResourceDetailResponseDto,
  ResourceResponseDto,
  ResourceState,
  ResourceV1ApiCreateResourceRequest,
  ResourceV1ApiUpdateResourceRequest,
  UpdateResourceRequestDto,
  UploadType,
} from '@endo4life/data-access';
import { IVideoEntity } from './video-entity';
import { IVideoCreateFormData, IVideoUpdateFormData } from './video-form-data';
import { IOption } from '@endo4life/types';

export interface IVideoMapper {
  fromDto(dto: ResourceResponseDto): IVideoEntity;
  toCreateFormData(entity: IVideoEntity): IVideoCreateFormData;
  toUpdateFormData(entity: IVideoEntity): IVideoUpdateFormData;
  toCreateVideoRequest(
    data: IVideoCreateFormData,
    tagOptions?: IOption[]
  ): IVideoCreateFormData;
  toUpdateVideoRequest(
    data: IVideoUpdateFormData,
    tagOptions?: IOption[]
  ): IVideoUpdateFormData;
  toCreateResourceRequest(
    data: IVideoCreateFormData
  ): ResourceV1ApiCreateResourceRequest;
  toUpdateResourceRequest(
    data: IVideoUpdateFormData
  ): UpdateResourceRequestDto;
}

export class VideoMapper implements IVideoMapper {
  fromDto(dto: ResourceResponseDto): IVideoEntity {
    if (!dto.id) throw new Error('Invalid Video DTO');
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
      anatomyLocationTag: dto.anatomyLocationTag || [],
      hpTag: dto.hpTag || [],
      lightTag: dto.lightTag || [],
      upperGastroAnatomyTag: dto.upperGastroAnatomyTag || [],
      metadata: dto,
    };
  }

  fromDetailDto(dto: ResourceDetailResponseDto): IVideoEntity {
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
      anatomyLocationTag: dto.anatomyLocationTag,
      hpTag: dto.hpTag,
      lightTag: dto.lightTag,
      upperGastroAnatomyTag: dto.upperGastroAnatomyTag,
      metadata: dto,
    };
  }

  toCreateFormData(entity: IVideoEntity): IVideoCreateFormData {
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
          anatomyLocationTag: entity.anatomyLocationTag,
          hpTag: entity.hpTag,
          lightTag: entity.lightTag,
          upperGastroAnatomyTag: entity.upperGastroAnatomyTag,
        },
      ],
      compressedFile: {} as File,
    };
  }

  toUpdateFormData(entity: IVideoEntity): IVideoUpdateFormData {
    return {
      id: entity.id,
      resourceUrl: entity.resourceUrl,
      // file: {} as File,
      metadata: {
        title: entity.title || '',
        description: entity.description || '',
        tag: entity.tag,
        detailTag: entity.detailTag,
        anatomyLocationTag: entity.anatomyLocationTag,
        hpTag: entity.hpTag,
        lightTag: entity.lightTag,
        upperGastroAnatomyTag: entity.upperGastroAnatomyTag,
        state: entity.state,
      },
      entity: entity,
    };
  }

  toCreateVideoRequest(
    form: IVideoCreateFormData,
    tagOptions?: IOption[]
  ): IVideoCreateFormData {
    if (tagOptions && tagOptions.length) {
      const convertIdsToNames = (ids?: string[]) => 
        ids?.map((id) => tagOptions.find((t) => t.value === id)?.label || 'Nhãn dán không hợp lệ');

      form.metadata?.forEach((item) => {
        item.tag = convertIdsToNames(item.tag);
        item.detailTag = convertIdsToNames(item.detailTag);
        item.anatomyLocationTag = convertIdsToNames(item.anatomyLocationTag);
        item.hpTag = convertIdsToNames(item.hpTag);
        item.lightTag = convertIdsToNames(item.lightTag);
        item.upperGastroAnatomyTag = convertIdsToNames(item.upperGastroAnatomyTag);
      });
    }
    return {
      type: form.type,
      files: form.files,
      metadata: form.metadata,
      compressedFile: form.compressedFile,
    };
  }

  toUpdateVideoRequest(
    data: IVideoUpdateFormData,
    tagOptions?: IOption[]
  ): IVideoUpdateFormData {
    if (!data.id) throw new Error('Invalid id');
    if (tagOptions && tagOptions.length) {
      const convertIdsToNames = (ids?: string[]) => 
        ids?.map((id) => tagOptions.find((t) => t.value === id)?.label || 'Nhãn dán không hợp lệ');

      data.metadata.tag = convertIdsToNames(data.metadata.tag);
      data.metadata.detailTag = convertIdsToNames(data.metadata.detailTag);
      data.metadata.anatomyLocationTag = convertIdsToNames(data.metadata.anatomyLocationTag);
      data.metadata.hpTag = convertIdsToNames(data.metadata.hpTag);
      data.metadata.lightTag = convertIdsToNames(data.metadata.lightTag);
      data.metadata.upperGastroAnatomyTag = convertIdsToNames(data.metadata.upperGastroAnatomyTag);
    }
    return {
      id: data.id,
      metadata: data.metadata,
      file: data.file,
    };
  }

  toCreateResourceRequest(
    data: IVideoCreateFormData
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
          anatomyLocationTag: data?.metadata[0]?.anatomyLocationTag,
          hpTag: data?.metadata[0]?.hpTag,
          lightTag: data?.metadata[0]?.lightTag,
          upperGastroAnatomyTag: data?.metadata[0]?.upperGastroAnatomyTag,
        },
      ],
      compressedFile: data.compressedFile,
    };
  }

  toUploadResourceRequest(
    data: IVideoCreateFormData
  ): ResourceV1ApiCreateResourceRequest {
    // Note: ZIP/Compressed imports are now handled directly in video-api.ts
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
          anatomyLocationTag: data?.metadata[index]?.anatomyLocationTag || [],
          hpTag: data?.metadata[index]?.hpTag || [],
          lightTag: data?.metadata[index]?.lightTag || [],
          upperGastroAnatomyTag: data?.metadata[index]?.upperGastroAnatomyTag || [],
        })) || [],
    };
  }

  toUpdateResourceRequest(
    data: IVideoUpdateFormData
  ): UpdateResourceRequestDto {
    const payload: UpdateResourceRequestDto = {
      title: data.metadata.title,
      description: data.metadata.description,
      state: data.metadata.state,
      tag: data.metadata.tag,
      detailTag: data.metadata.detailTag,
      anatomyLocationTag: data.metadata.anatomyLocationTag,
      hpTag: data.metadata.hpTag,
      lightTag: data.metadata.lightTag,
      upperGastroAnatomyTag: data.metadata.upperGastroAnatomyTag,
    };

    // If a new file was uploaded, include the attachment field (objectKey)
    if ((data as any).fileKey) {
      payload.attachment = (data as any).fileKey;
    }

    return payload;
  }
}
