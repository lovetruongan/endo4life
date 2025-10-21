import { BaseApi, DoctorUserConversationsV1Api, IdWrapperDto, StorageApiImpl } from "@endo4life/data-access";
import { EnvConfig } from "@endo4life/feature-config";
import { DEFAULT_PAGINATION, IFilter } from "@endo4life/types";
import { DoctorUserConversationFilter, DoctorUserConversationMapper, IDoctorUserConversationCreateFormData } from "../types";
import { objectUtils } from "@endo4life/util-common";

export class DoctorUserConversationApiImpl extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl);
  }

  async getDoctorUserConversations(
    filter: IFilter
  ) {
    const config = await this.getApiConfiguration();
    const api = new DoctorUserConversationsV1Api(config);
    const conversationFilter = new DoctorUserConversationFilter(filter);
    const criteria = conversationFilter.toCriteria();
    const pageable = conversationFilter.toPageable();
    const response = await api.getDoctorUserConversations({ criteria, pageable });
    return {
      data: response.data.data?.map((conversation) =>
        DoctorUserConversationMapper.getInstance().fromDto(conversation),
      ),
      pagination: {
        page: filter.page ?? DEFAULT_PAGINATION.PAGE,
        size: filter.size ?? DEFAULT_PAGINATION.PAGE_SIZE,
        totalCount: response.data.total ?? 0,
      },
    };
  }

  async createDoctorUserConversation(data: IDoctorUserConversationCreateFormData): Promise<IdWrapperDto> {
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
    const api = new DoctorUserConversationsV1Api(config);
    const result = await api.createConversationDoctorAndUser(DoctorUserConversationMapper.getInstance().toCreateRequest(data));
    return result.data;
  }
}

