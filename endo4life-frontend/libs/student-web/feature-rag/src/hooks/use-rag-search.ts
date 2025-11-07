import { useMutation } from 'react-query';
import { useAuthContext } from '@endo4life/feature-auth';
import * as RagRetriever from '../api/rag-retriever';

export function useRagSearch() {
  const { keycloak } = useAuthContext();

  return useMutation(
    async (request: RagRetriever.SearchRequest) => {
      const token = keycloak?.token;
      return RagRetriever.search(request, token);
    },
    {
      onError: (error) => {
        console.error('RAG search failed:', error);
      },
    }
  );
}

