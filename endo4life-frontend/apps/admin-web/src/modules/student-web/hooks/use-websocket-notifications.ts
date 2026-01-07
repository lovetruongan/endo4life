import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthContext } from '@endo4life/feature-auth';
import { EnvConfig } from '@endo4life/feature-config';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

export interface WebSocketNotification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  createdAt: string;
  isUnread: boolean;
}

export function useWebSocketNotifications() {
  const { userProfile, isAuthenticated } = useAuthContext();
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const userId = userProfile?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    // Create STOMP client over SockJS
    const wsUrl = `${EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080'}/ws`;
    
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WebSocket]', str);
        }
      },
    });

    client.onConnect = () => {
      console.log('[WebSocket] Connected');
      setConnected(true);

      // Subscribe to user-specific notifications
      client.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
        try {
          const notification = JSON.parse(message.body) as WebSocketNotification;
          console.log('[WebSocket] Received notification:', notification);
          
          setNotifications((prev) => {
            // Avoid duplicates
            if (prev.some((n) => n.id === notification.id)) {
              return prev;
            }
            return [notification, ...prev];
          });
        } catch (error) {
          console.error('[WebSocket] Failed to parse notification:', error);
        }
      });
    };

    client.onDisconnect = () => {
      console.log('[WebSocket] Disconnected');
      setConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers['message']);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [isAuthenticated, userId]);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, isUnread: false } : n
      )
    );
  }, []);

  return {
    notifications,
    connected,
    unreadCount: notifications.filter((n) => n.isUnread).length,
    clearNotification,
    clearAllNotifications,
    markAsRead,
  };
}

