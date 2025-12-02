import { EnvConfig } from '@endo4life/feature-config';
import { BaseApi } from '@endo4life/data-access';
import axios from 'axios';

export interface UserGrowthStat {
  date: string;
  count: number;
  cumulativeCount: number;
}

export interface ResourceViewStat {
  id: string;
  title: string;
  type: string;
  viewCount: number;
  thumbnailUrl?: string;
}

export class StatsApiImpl extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
  }

  async getUserGrowthStats(days: number = 30): Promise<UserGrowthStat[]> {
    const authorization = await this.getAuthorization();
    const response = await axios.get<UserGrowthStat[]>(
      `${this.getBasePath()}/api/v1/stats/user-growth`,
      {
        params: { days },
        headers: { Authorization: authorization },
      },
    );
    return response.data;
  }

  async getResourceViewsStats(
    limit: number = 10,
    type?: string,
  ): Promise<ResourceViewStat[]> {
    const authorization = await this.getAuthorization();
    const response = await axios.get<ResourceViewStat[]>(
      `${this.getBasePath()}/api/v1/stats/resource-views`,
      {
        params: { limit, type },
        headers: { Authorization: authorization },
      },
    );
    return response.data;
  }
}

export const statsApi = new StatsApiImpl();

