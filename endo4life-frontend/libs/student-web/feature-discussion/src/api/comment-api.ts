import { BaseApi, CommentV1Api, IdWrapperDto, StorageApiImpl } from "@endo4life/data-access";
import { EnvConfig } from "@endo4life/feature-config";
import { DEFAULT_PAGINATION, IFilter } from "@endo4life/types";
import { CommentFilter, CommentMapper, ICommentCreateFormData } from "../types";
import { objectUtils } from "@endo4life/util-common";

export interface ICommentApi {

}

export class CommentApiIml extends BaseApi implements ICommentApi {
  constructor() {
    super(EnvConfig.ElearningServiceUrl);
  }

  async getComments(
    filter: IFilter
  ) {
    const config = await this.getApiConfiguration();
    const api = new CommentV1Api(config);
    const commentFilter = new CommentFilter(filter);
    const criteria = commentFilter.toCriteria();
    const pageable = commentFilter.toPageable();
    const response = await api.getComments({ criteria, pageable });
    return {
      data: response.data.data?.map((comment) =>
        CommentMapper.getInstance().fromDto(comment),
      ),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.PAGE_SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async createComment(data: ICommentCreateFormData): Promise<IdWrapperDto> {
    if (data.attachments.length) {
      const storageApi = new StorageApiImpl(this.getBasePath());
      for (let i = 0; i < data.attachments.length; i++) {
        data.attachments[i].id = await storageApi.uploadFile(
          objectUtils.defaultObject(data.attachments[i].file),
          'IMAGE',
        );
      }
    }
    const config = await this.getApiConfiguration();
    const api = new CommentV1Api(config);
    const result = await api.createComment(CommentMapper.getInstance().toCreateCommentRequest(data));
    return result.data;
  }
}
