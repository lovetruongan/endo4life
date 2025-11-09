import { useMutation, useQueryClient } from 'react-query';
import {
  CertificateV1Api,
  BaseApi,
  StorageApiImpl,
  ResourceType,
} from '@endo4life/data-access';
import { EnvConfig } from '@endo4life/feature-config';
import { REACT_QUERY_KEYS } from '../constants';

class CertificateApiHelper extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
  }

  async getCertificateApi() {
    const config = await this.getApiConfiguration();
    return new CertificateV1Api(config);
  }
}

export interface UploadCertificateParams {
  userId: string;
  files: File[];
  titles?: string[];
  descriptions?: string[];
}

export const useCertificateUpload = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (params: UploadCertificateParams) => {
      const helper = new CertificateApiHelper();
      const api = await helper.getCertificateApi();
      const storageApi = new StorageApiImpl(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');

      const results = [];

      for (let i = 0; i < params.files.length; i++) {
        const file = params.files[i];
        
        try {
          // Upload file to MinIO (returns the object key/UUID)
          const objectKey = await storageApi.uploadFile(
            file,
            ResourceType.Other
          );

          // Create certificate record
          const title = params.titles?.[i] || file.name.replace(/\.[^/.]+$/, '');
          const description = params.descriptions?.[i] || '';

          const response = await api.createProfessionalCertificate({
            createCertificateRequestDto: {
              title,
              description,
              filePath: objectKey,
              fileType: file.type,
              userId: params.userId,
            },
          });

          results.push(response.data);
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          throw error;
        }
      }

      return results;
    },
    {
      onSuccess: (_, variables) => {
        // Invalidate certificates cache for this user
        queryClient.invalidateQueries([REACT_QUERY_KEYS.CERTIFICATES, variables.userId]);
      },
    }
  );

  return mutation;
};

