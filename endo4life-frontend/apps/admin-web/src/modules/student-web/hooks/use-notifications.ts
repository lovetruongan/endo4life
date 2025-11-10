import { useAuthContext } from '@endo4life/feature-auth';
import { useDoctorUserConversations } from '@endo4life/feature-discussion';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useCommentNotifications } from './use-comment-notifications';

export type NotificationType = 'CONVERSATION' | 'COMMENT';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  link: string;
  createdAt: Date;
  isUnread: boolean;
  state?: string;
  resourceId?: string;
}

const READ_NOTIFICATIONS_KEY = 'read_notifications';

// Helper functions for localStorage
const getReadNotifications = (): string[] => {
  try {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveReadNotifications = (readIds: string[]) => {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
  } catch (error) {
    console.error('Failed to save read notifications:', error);
  }
};

/**
 * Unified notification hook that handles both:
 * - Doctor-User Conversations (Q&A)
 * - Comments on resources (videos/images)
 */
export function useNotifications() {
  const { userProfile } = useAuthContext();
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Load read notifications from localStorage on mount
  useEffect(() => {
    setReadNotificationIds(getReadNotifications());
  }, []);

  // Determine filter based on user role
  const isSpecialist = userProfile?.roles?.[0] === 'SPECIALIST';
  const filterField = isSpecialist ? 'assigneeId' : 'questionerId';

  // Get all conversations for the user
  const { data: conversations, loading: conversationsLoading, refetch: refetchConversations } = useDoctorUserConversations(
    {
      page: 0,
      size: 50,
      sort: {
        field: 'updatedAt',
        order: 'DESC' as any,
      },
    },
    filterField,
    userProfile?.id,
  );

  // Process conversation notifications
  const conversationNotifications = useMemo(() => {
    if (!conversations || !Array.isArray(conversations)) return [];

    const notifs: INotification[] = [];

    conversations.forEach((conversation) => {
      const isSpecialist = userProfile?.roles?.[0] === 'SPECIALIST';

      // Check if there are new replies
      if (conversation.replies && conversation.replies.length > 0) {
        conversation.replies.forEach((reply) => {
          // Consider a reply as unread if it's from someone other than the current user
          // and was created within the last 7 days
          const isRecent =
            new Date().getTime() - new Date(reply.createdAt || '').getTime() <
            7 * 24 * 60 * 60 * 1000;

          if (isRecent && reply.questionerId !== userProfile?.id) {
            const title = isSpecialist
              ? 'New Reply from Patient'
              : 'New Reply to Your Question';
            
            notifs.push({
              id: `conv-${reply.id}`,
              type: 'CONVERSATION',
              title,
              content:
                reply.content?.substring(0, 100) +
                (reply.content && reply.content.length > 100 ? '...' : ''),
              link: `/my-questions`,
              createdAt: new Date(reply.createdAt || ''),
              isUnread: true,
              state: conversation.state,
              resourceId: conversation.resourceId,
            });
          }
        });
      }

      // For specialists: notify about new questions assigned to them
      if (
        isSpecialist &&
        !conversation.replies?.length &&
        new Date().getTime() - new Date(conversation.createdAt || '').getTime() <
          7 * 24 * 60 * 60 * 1000
      ) {
        notifs.push({
          id: `conv-${conversation.id}-new`,
          type: 'CONVERSATION',
          title: 'New Question Assigned',
          content:
            conversation.content?.substring(0, 100) +
            (conversation.content && conversation.content.length > 100 ? '...' : ''),
          link: `/my-questions`,
          createdAt: new Date(conversation.createdAt || ''),
          isUnread: true,
          state: conversation.state,
          resourceId: conversation.resourceId,
        });
      }

      // For students: notify about state changes
      if (
        !isSpecialist &&
        conversation.state === 'RESOLVED' &&
        new Date().getTime() - new Date(conversation.updatedAt || '').getTime() <
          3 * 24 * 60 * 60 * 1000
      ) {
        notifs.push({
          id: `conv-${conversation.id}-resolved`,
          type: 'CONVERSATION',
          title: 'Question Resolved',
          content: 'Your question has been marked as resolved',
          link: `/my-questions`,
          createdAt: new Date(conversation.updatedAt || ''),
          isUnread: true,
          state: conversation.state,
          resourceId: conversation.resourceId,
        });
      }
    });

    return notifs;
  }, [conversations, userProfile?.id, userProfile?.roles]);

  // Get comment notifications
  const { 
    notifications: commentNotifs, 
    loading: commentsLoading,
    refetch: refetchComments 
  } = useCommentNotifications();
  
  const commentNotifications = commentNotifs;

  // Combine all notifications and apply read status
  const allNotifications = useMemo(() => {
    const combined = [...conversationNotifications, ...commentNotifications];
    
    // Mark notifications as read if they're in readNotificationIds
    const withReadStatus = combined.map((notif) => ({
      ...notif,
      isUnread: !readNotificationIds.includes(notif.id),
    }));
    
    // Sort by date descending
    return withReadStatus.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [conversationNotifications, commentNotifications, readNotificationIds]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => n.isUnread).length;
  }, [allNotifications]);

  // Mark a single notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(notificationId)) return prev;
      const updated = [...prev, notificationId];
      saveReadNotifications(updated);
      return updated;
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    const allIds = allNotifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    saveReadNotifications(allIds);
  }, [allNotifications]);

  const refetch = () => {
    refetchConversations();
    refetchComments();
  };

  return {
    notifications: allNotifications,
    unreadCount,
    loading: conversationsLoading || commentsLoading,
    refetch,
    markAsRead,
    markAllAsRead,
  };
}

