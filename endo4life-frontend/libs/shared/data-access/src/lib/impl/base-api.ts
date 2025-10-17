import { Configuration } from '../generated';
import moment from 'moment';
import { keycloakUtils } from '../keycloak';

export abstract class BaseApi {
  private readonly basePath: string;
  constructor(basePath: string) {
    this.basePath = basePath;
  }

  getBasePath() {
    return this.basePath;
  }

  async getAuthorization() {
    const accessToken = await keycloakUtils.refreshToken();
    return `Bearer ${accessToken}`;
  }

  async getApiConfiguration() {
    const Authorization = await this.getAuthorization();
    const Timezone = moment().format('Z z');
    return new Configuration({
      basePath: this.basePath,
      baseOptions: {
        headers: {
          Authorization,
          // 'X-Timezone': Timezone,
        },
      },
    });
  }
}

export default BaseApi;
