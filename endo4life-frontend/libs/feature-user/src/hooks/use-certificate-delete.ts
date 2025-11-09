import { useMutation, useQueryClient } from 'react-query';
import { CertificateV1Api, BaseApi } from '@endo4life/data-access';
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

export interface DeleteCertificateParams {
  certificateId: string;
  userId?: string;
}

export const useCertificateDelete = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (params: DeleteCertificateParams) => {
      const helper = new CertificateApiHelper();
      const api = await helper.getCertificateApi();

      await api.deleteCertificate({
        id: params.certificateId,
      });

      return params;
    },
    {
      onSuccess: (data) => {
        // Invalidate certificates cache
        if (data.userId) {
          queryClient.invalidateQueries([REACT_QUERY_KEYS.CERTIFICATES, data.userId]);
        }
        queryClient.invalidateQueries([REACT_QUERY_KEYS.CERTIFICATES]);
      },
    }
  );

  return mutation;
};

