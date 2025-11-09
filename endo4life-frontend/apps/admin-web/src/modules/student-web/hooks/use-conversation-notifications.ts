import { useAuthContext } from '@endo4life/feature-auth';
import { useDoctorUserConversations } from '@endo4life/feature-discussion';
import { useMemo } from 'react';

export interface IConversationNotification {
  id: string;
  title: string;
  content: string;
  link: string;
  createdAt: Date;
  isUnread: boolean;
  state?: string;
}

export function useConversationNotifications() {
  const { userProfile } = useAuthContext();

  // Determine filter based on user role
  // SPECIALIST: see questions assigned to them (assigneeId)
  // CUSTOMER/STUDENT: see questions they created (questionerId)
  const isSpecialist = userProfile?.roles?.[0] === 'SPECIALIST';
  const filterField = isSpecialist ? 'assigneeId' : 'questionerId';

  // Get all conversations for the user
  const { data: conversations, loading, refetch } = useDoctorUserConversations(
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

  const notifications = useMemo(() => {
    if (!conversations || !Array.isArray(conversations)) return [];

    const notifs: IConversationNotification[] = [];

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
              id: reply.id || '',
              title,
              content:
                reply.content?.substring(0, 100) +
                (reply.content && reply.content.length > 100 ? '...' : ''),
              link: `/my-questions`,
              createdAt: new Date(reply.createdAt || ''),
              isUnread: true,
              state: conversation.state,
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
          id: `${conversation.id}-new`,
          title: 'New Question Assigned',
          content:
            conversation.content?.substring(0, 100) +
            (conversation.content && conversation.content.length > 100 ? '...' : ''),
          link: `/my-questions`,
          createdAt: new Date(conversation.createdAt || ''),
          isUnread: true,
          state: conversation.state,
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
          id: `${conversation.id}-resolved`,
          title: 'Question Resolved',
          content: 'Your question has been marked as resolved',
          link: `/my-questions`,
          createdAt: new Date(conversation.updatedAt || ''),
          isUnread: true,
          state: conversation.state,
        });
      }
    });

    // Sort by date descending
    return notifs.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [conversations, userProfile?.id]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.isUnread).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refetch,
  };
}

