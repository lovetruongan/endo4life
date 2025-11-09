import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './use-websocket';
import { v4 as uuidv4 } from 'uuid';

export interface ZipUploadProgress {
  sessionId: string;
  processed?: number;
  total?: number;
  message?: string;
  progress?: number;
  status?: 'UPLOADING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
}

export interface UseZipUploadProgressReturn {
  sessionId: string;
  progress: ZipUploadProgress | null;
  isUploading: boolean;
  resetProgress: () => void;
}

export function useZipUploadProgress(): UseZipUploadProgressReturn {
  const [sessionId] = useState(() => uuidv4());
  const [progress, setProgress] = useState<ZipUploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const { isConnected, subscribe } = useWebSocket({
    autoConnect: true,
    onConnect: () => {
      console.log('[ZipUpload] WebSocket connected');
    },
    onError: (error) => {
      console.error('[ZipUpload] WebSocket error:', error);
    },
  });

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const destination = `/topic/zip-upload-progress/${sessionId}`;
    console.log('[ZipUpload] Subscribing to:', destination);

    unsubscribeRef.current = subscribe(destination, (message) => {
      console.log('[ZipUpload] Received message:', message);

      if (message.status === 'SUCCESS') {
        setProgress({
          sessionId: message.sessionId,
          status: 'SUCCESS',
          message: message.message,
          progress: 100,
        });
        setIsUploading(false);
      } else if (message.status === 'FAILED') {
        setProgress({
          sessionId: message.sessionId,
          status: 'FAILED',
          message: message.message,
        });
        setIsUploading(false);
      } else {
        setProgress({
          sessionId: message.sessionId,
          processed: message.processed,
          total: message.total,
          message: message.message,
          progress: message.progress,
          status: 'PROCESSING',
        });
        setIsUploading(true);
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isConnected, sessionId, subscribe]);

  const resetProgress = useCallback(() => {
    setProgress(null);
    setIsUploading(false);
  }, []);

  return {
    sessionId,
    progress,
    isUploading,
    resetProgress,
  };
}

