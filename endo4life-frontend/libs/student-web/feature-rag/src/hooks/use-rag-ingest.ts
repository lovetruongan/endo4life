import { useMutation, useQuery } from 'react-query';
import { useAuthContext } from '@endo4life/feature-auth';
import * as RagIngestor from '../api/rag-ingestor';

export function useCreateCollection() {
  const { keycloak } = useAuthContext();

  return useMutation(
    async (request: RagIngestor.CreateCollectionRequest) => {
      const token = keycloak?.token;
      return RagIngestor.createCollection(request, token);
    },
    {
      onError: (error) => {
        console.error('Create collection failed:', error);
      },
    }
  );
}

export function useUploadDocuments() {
  const { keycloak } = useAuthContext();

  return useMutation(
    async (request: RagIngestor.UploadDocumentsRequest) => {
      const token = keycloak?.token;
      return RagIngestor.uploadDocuments(request, token);
    },
    {
      onError: (error) => {
        console.error('Upload documents failed:', error);
      },
    }
  );
}

export function useTaskStatus(taskId: string | null, enabled = false) {
  const { keycloak } = useAuthContext();

  return useQuery(
    ['rag-task-status', taskId],
    async () => {
      if (!taskId) throw new Error('No task ID');
      const token = keycloak?.token;
      return RagIngestor.getTaskStatus(taskId, token);
    },
    {
      enabled: enabled && !!taskId,
      refetchInterval: (data) => {
        // Poll every 2 seconds until finished
        // Check both 'state' and 'status' fields as API might use either
        const status = (data as any)?.state || data?.status;
        if (status === 'FINISHED' || status === 'FAILED' || status === 'SUCCESS') {
          return false;
        }
        return 2000;
      },
      refetchOnWindowFocus: false,
    }
  );
}

export function useCollections() {
  const { keycloak } = useAuthContext();

  return useQuery(
    ['rag-collections'],
    async () => {
      const token = keycloak?.token;
      return RagIngestor.getCollections(token);
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

export function useDocuments(collectionName: string | null) {
  const { keycloak } = useAuthContext();

  return useQuery(
    ['rag-documents', collectionName],
    async () => {
      if (!collectionName) throw new Error('No collection name');
      const token = keycloak?.token;
      return RagIngestor.getDocuments(collectionName, token);
    },
    {
      enabled: !!collectionName,
      refetchOnWindowFocus: false,
    }
  );
}

