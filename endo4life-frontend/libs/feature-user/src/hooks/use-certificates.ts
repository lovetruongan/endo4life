import { useQuery } from 'react-query';
import { CertificateV1Api, CertificateResponseDto, BaseApi } from '@endo4life/data-access';
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

export const useCertificates = (userId?: string) => {
  const { data, error, isFetching } = useQuery<CertificateResponseDto[]>(
    [REACT_QUERY_KEYS.CERTIFICATES, userId],
    async () => {
      const helper = new CertificateApiHelper();
      const api = await helper.getCertificateApi();
      const response = await api.getUserCertificates({
        userId: userId,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!userId, // Only run query if userId is provided
    }
  );

  return {
    data,
    error,
    isLoading: isFetching,
  };
};

export const useCourseCertificate = (courseId?: string, userId?: string) => {
  const { data, error, isFetching } = useQuery<CertificateResponseDto>(
    [REACT_QUERY_KEYS.COURSE_CERTIFICATE, courseId, userId],
    async () => {
      const helper = new CertificateApiHelper();
      const api = await helper.getCertificateApi();
      const response = await api.getCourseCertificate({
        courseId: courseId!,
        userId: userId!,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!courseId && !!userId, // Only run query if both are provided
    }
  );

  return {
    data,
    error,
    isLoading: isFetching,
  };
};

