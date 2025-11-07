import { EnvConfig } from '@endo4life/feature-config';

export interface GenerateRequest {
  messages: Array<{ role: string; content: string }>;
  use_knowledge_base?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  reranker_top_k?: number;
  vdb_top_k?: number;
  vdb_endpoint?: string;
  collection_names?: string[];
  enable_query_rewriting?: boolean;
  enable_reranker?: boolean;
  enable_citations?: boolean;
  stop?: string[];
  filter_expr?: string;
}

export interface SearchRequest {
  query: string;
  reranker_top_k?: number;
  vdb_top_k?: number;
  vdb_endpoint?: string;
  collection_names?: string[];
  messages?: Array<{ role: string; content: string }>;
  enable_query_rewriting?: boolean;
  enable_reranker?: boolean;
  filter_expr?: string;
}

export interface StreamChunk {
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  citations?: Array<{
    document_id?: string;
    content?: string;
    metadata?: Record<string, any>;
    score?: number;
  }>;
  metrics?: {
    llm_generation_time_ms?: number;
    llm_ttft_ms?: number;
    context_reranker_time_ms?: number;
    retrieval_time_ms?: number;
    rag_ttft_ms?: number;
  };
}

export interface SearchResult {
  total_results: number;
  results: Array<{
    document_id: string;
    content: string;
    document_name?: string;
    document_type?: string;
    score?: number;
    metadata?: Record<string, any>;
  }>;
}

export interface HealthResponse {
  status: string;
  dependencies?: Record<string, any>;
}

/**
 * Stream generate responses from RAG server
 */
export async function* streamGenerate(
  body: GenerateRequest,
  token?: string
): AsyncGenerator<StreamChunk> {
  const resp = await fetch(`${EnvConfig.RagRetrieverBaseUrl}/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(`RAG generate failed: ${resp.statusText}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      const jsonStr = trimmed.slice(6);
      if (!jsonStr) continue;

      try {
        const evt: StreamChunk = JSON.parse(jsonStr);
        yield evt;
      } catch (e) {
        console.warn('Failed to parse SSE chunk:', e);
      }
    }
  }
}

/**
 * Search for documents without generating a response
 */
export async function search(
  payload: SearchRequest,
  token?: string
): Promise<SearchResult> {
  const resp = await fetch(`${EnvConfig.RagRetrieverBaseUrl}/v1/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    throw new Error(`RAG search failed: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Check health of RAG retriever service
 */
export async function checkHealth(
  checkDependencies = true
): Promise<HealthResponse> {
  const params = new URLSearchParams({
    check_dependencies: String(checkDependencies),
  });

  const resp = await fetch(
    `${EnvConfig.RagRetrieverBaseUrl}/v1/health?${params}`
  );

  if (!resp.ok) {
    throw new Error(`Health check failed: ${resp.statusText}`);
  }

  return resp.json();
}

