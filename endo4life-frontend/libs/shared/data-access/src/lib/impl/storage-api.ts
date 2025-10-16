import axios from 'axios';
import BaseApi from './base-api';
import { MinioV1Api, ResourceType } from '../generated';

export interface IStorageApi {
  getPresignUrls(
    numUrls: number,
    resourceType?: ResourceType,
  ): Promise<string[]>;

  uploadFile(
    file: File,
    type?: ResourceType,
    presignedUrl?: string,
  ): Promise<string>;
  uploadFiles(files: File[], type?: ResourceType): Promise<string[]>;
}

export class StorageApiImpl extends BaseApi implements IStorageApi {
  constructor(url: string) {
    super(url);
  }
  async getPresignUrls(
    numUrls: number,
    resourceType: ResourceType = 'IMAGE',
  ): Promise<string[]> {
    const config = await this.getApiConfiguration();
    const presignApi = new MinioV1Api(config);
    return presignApi
      .generatePreSignedUrls({
        generatePreSignedUrlDto: {
          resourceType,
          numberOfUrls: numUrls,
        },
      })
      .then((res) => res.data);
  }

  async uploadFile(
    file: File,
    type: ResourceType = ResourceType.Image,
    presignedUrl?: string,
  ): Promise<string> {
    let url = presignedUrl;
    if (!url) {
      url = await this.getPresignUrls(1, type).then((res) => res[0]);
    }
    if (!url) throw new Error('Failed to upload image');
    await axios.put(url, file, { headers: { 'Content-Type': file.type } });
    return getObjectKeyFromSignedUrl(url);
  }

  async uploadFiles(
    files: File[],
    type: ResourceType = ResourceType.Image,
  ): Promise<string[]> {
    const results: string[] = [];
    if (files.length === 0) return results;
    const urls = await this.getPresignUrls(files.length);
    if (urls.length !== files.length) return results;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const file = files[i];
      await this.uploadFile(file, type, url);
      results.push(url);
    }

    return results.map(getObjectKeyFromSignedUrl);
  }
}

function getObjectKeyFromSignedUrl(presignedUrl: string) {
  const url = new URL(presignedUrl);
  const path = url.pathname;
  return path.substring(path.lastIndexOf('/') + 1, path.length);
}
