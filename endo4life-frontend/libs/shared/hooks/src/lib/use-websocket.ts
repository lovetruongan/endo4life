import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { EnvConfig } from '@endo4life/feature-config';

export interface UseWebSocketOptions {
  url?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  autoConnect?: boolean;
}

export interface WebSocketMessage {
  [key: string]: any;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `${EnvConfig.Endo4LifeServiceUrl}/ws`,
    onConnect,
    onDisconnect,
    onError,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting to:', url);
    
    const client = new Client({
      webSocketFactory: () => new SockJS(url) as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        onConnect?.();
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        onDisconnect?.();
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame);
        onError?.(frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [url, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log('[WebSocket] Disconnecting');
      clientRef.current.deactivate();
      clientRef.current = null;
      subscriptionsRef.current.clear();
    }
  }, []);

  const subscribe = useCallback(
    (destination: string, callback: (message: WebSocketMessage) => void) => {
      if (!clientRef.current?.connected) {
        console.warn('[WebSocket] Not connected, cannot subscribe to:', destination);
        return () => {};
      }

      console.log('[WebSocket] Subscribing to:', destination);
      const subscription = clientRef.current.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      subscriptionsRef.current.set(destination, subscription);

      return () => {
        console.log('[WebSocket] Unsubscribing from:', destination);
        subscription.unsubscribe();
        subscriptionsRef.current.delete(destination);
      };
    },
    []
  );

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
  };
}

