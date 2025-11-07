import { useState, useCallback } from 'react';
import { useAuthContext } from '@endo4life/feature-auth';
import * as RagRetriever from '../api/rag-retriever';

export interface GenerateState {
  isGenerating: boolean;
  answer: string;
  citations: RagRetriever.StreamChunk['citations'];
  metrics: RagRetriever.StreamChunk['metrics'];
  error: string | null;
}

export function useRagGenerate() {
  const { keycloak } = useAuthContext();
  const [state, setState] = useState<GenerateState>({
    isGenerating: false,
    answer: '',
    citations: undefined,
    metrics: undefined,
    error: null,
  });

  const generate = useCallback(
    async (request: RagRetriever.GenerateRequest) => {
      setState({
        isGenerating: true,
        answer: '',
        citations: undefined,
        metrics: undefined,
        error: null,
      });

      try {
        const token = keycloak?.token;
        let accumulatedAnswer = '';

        for await (const chunk of RagRetriever.streamGenerate(request, token)) {
          // Extract content from chunk
          const content = chunk.choices?.[0]?.message?.content || '';
          if (content) {
            accumulatedAnswer += content;
          }

          // Update state with accumulated answer and any new data
          setState((prev) => ({
            ...prev,
            answer: accumulatedAnswer,
            citations: chunk.citations || prev.citations,
            metrics: chunk.metrics || prev.metrics,
          }));

          // Check if generation is complete
          const finishReason = chunk.choices?.[0]?.finish_reason;
          if (finishReason === 'stop') {
            setState((prev) => ({
              ...prev,
              isGenerating: false,
            }));
            break;
          }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    },
    [keycloak]
  );

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      answer: '',
      citations: undefined,
      metrics: undefined,
      error: null,
    });
  }, []);

  return {
    ...state,
    generate,
    reset,
  };
}

