import {
  ResourceDetailResponseDto,
  ResourceResponseDto,
  ResourceState,
  ResourceV1ApiCreateResourceRequest,
  ResourceV1ApiUpdateResourceRequest,
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
  ): ResourceV1ApiUpdateResourceRequest;
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
      time: dto.time,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      tag: dto.tag,
      detailTag: dto.detailTag,
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

  toUpdateVideoRequest(
    data: IVideoUpdateFormData,
    tagOptions?: IOption[]
  ): IVideoUpdateFormData {
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
        },
      ],
      compressedFile: data.compressedFile,
    };
  }

  toUploadResourceRequest(
    data: IVideoCreateFormData
  ): ResourceV1ApiCreateResourceRequest {
    if (data.type === UploadType.Compressed) {
      return {
        type: data.type,
        compressedFile: data.compressedFile,
      };
    }
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
      compressedFile: data.compressedFile,
    };
  }

  toUpdateResourceRequest(
    data: IVideoUpdateFormData
  ): ResourceV1ApiUpdateResourceRequest {
    return {
      id: data.id,
      file: data.file,
      metadata: {
        title: data.metadata.title,
        description: data.metadata.description,
        state: data.metadata.state,
        tag: data.metadata.tag,
        detailTag: data.metadata.detailTag,
      },
    };
  }
}
