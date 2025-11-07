import { EnvConfig } from '@endo4life/feature-config';

export interface CreateCollectionRequest {
  collection_name: string;
  embedding_dimension?: number;
  metadata_schema?: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
}

export interface UploadDocumentsRequest {
  files: File[];
  collection_name: string;
  blocking?: boolean;
  split_options?: {
    chunk_size?: number;
    chunk_overlap?: number;
  };
  custom_metadata?: Array<{
    filename: string;
    metadata: Record<string, any>;
  }>;
  generate_summary?: boolean;
}

export interface UploadDocumentsResponse {
  task_id?: string;
  message?: string;
}

export interface TaskStatusResponse {
  status: string;
  progress?: number;
  message?: string;
  result?: any;
}

export interface CollectionInfo {
  collection_name: string;
  num_entities: number;
  metadata_schema: Array<{
    name: string;
    type: string;
    required: boolean;
    array_type: string | null;
    max_length: number | null;
    description: string;
  }>;
}

export interface CollectionsResponse {
  message: string;
  total_collections: number;
  collections: CollectionInfo[];
}

export interface DocumentsResponse {
  documents: Array<{
    filename: string;
    collection_name: string;
    uploaded_at?: string;
  }>;
}

export interface HealthResponse {
  status: string;
  dependencies?: Record<string, any>;
}

/**
 * Create a new collection in the vector store
 */
export async function createCollection(
  request: CreateCollectionRequest,
  token?: string
): Promise<{ message: string }> {
  const resp = await fetch(`${EnvConfig.RagIngestorBaseUrl}/v1/collection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!resp.ok) {
    throw new Error(`Create collection failed: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Upload documents to a collection
 */
export async function uploadDocuments(
  request: UploadDocumentsRequest,
  token?: string
): Promise<UploadDocumentsResponse> {
  const formData = new FormData();

  // Add files
  request.files.forEach((file) => {
    formData.append('documents', file);
  });

  // Add data payload
  const data = {
    collection_name: request.collection_name,
    blocking: request.blocking ?? false,
    split_options: request.split_options ?? {
      chunk_size: 512,
      chunk_overlap: 150,
    },
    custom_metadata: request.custom_metadata ?? [],
    generate_summary: request.generate_summary ?? false,
  };

  formData.append('data', JSON.stringify(data));

  const resp = await fetch(`${EnvConfig.RagIngestorBaseUrl}/v1/documents`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!resp.ok) {
    throw new Error(`Upload documents failed: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Get status of an upload task
 */
export async function getTaskStatus(
  taskId: string,
  token?: string
): Promise<TaskStatusResponse> {
  const params = new URLSearchParams({ task_id: taskId });

  const resp = await fetch(
    `${EnvConfig.RagIngestorBaseUrl}/v1/status?${params}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!resp.ok) {
    throw new Error(`Get task status failed: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Get list of collections
 */
export async function getCollections(
  token?: string
): Promise<CollectionsResponse> {
  const resp = await fetch(`${EnvConfig.RagIngestorBaseUrl}/v1/collections`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!resp.ok) {
    throw new Error(`Get collections failed: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Get list of documents in a collection
 */
export async function getDocuments(
  collectionName: string,
  token?: string
): Promise<DocumentsResponse> {
  const params = new URLSearchParams({ collection_name: collectionName });

  const resp = await fetch(
    `${EnvConfig.RagIngestorBaseUrl}/v1/documents?${params}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!resp.ok) {
    throw new Error(`Get documents failed: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Delete documents from a collection
 */
export async function deleteDocuments(
  collectionName: string,
  fileNames: string[],
  token?: string
): Promise<{ message: string }> {
  const params = new URLSearchParams({ collection_name: collectionName });

  const resp = await fetch(
    `${EnvConfig.RagIngestorBaseUrl}/v1/documents?${params}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(fileNames),
    }
  );

  if (!resp.ok) {
    throw new Error(`Delete documents failed: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Check health of RAG ingestor service
 */
export async function checkHealth(
  checkDependencies = true
): Promise<HealthResponse> {
  const params = new URLSearchParams({
    check_dependencies: String(checkDependencies),
  });

  const resp = await fetch(
    `${EnvConfig.RagIngestorBaseUrl}/v1/health?${params}`
  );

  if (!resp.ok) {
    throw new Error(`Health check failed: ${resp.statusText}`);
  }

  return resp.json();
}

