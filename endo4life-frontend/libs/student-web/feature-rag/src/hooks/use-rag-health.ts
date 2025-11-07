import { useQuery } from 'react-query';
import * as RagRetriever from '../api/rag-retriever';
import * as RagIngestor from '../api/rag-ingestor';

export function useRetrieverHealth(enabled = true) {
  return useQuery(
    ['rag-retriever-health'],
    () => RagRetriever.checkHealth(true),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error('Retriever health check failed:', error);
      },
    }
  );
}

export function useIngestorHealth(enabled = true) {
  return useQuery(
    ['rag-ingestor-health'],
    () => RagIngestor.checkHealth(true),
    {
      enabled,
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error('Ingestor health check failed:', error);
      },
    }
  );
}

