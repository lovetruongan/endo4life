import { useAuthContext } from '@endo4life/feature-auth';
import { useComments } from '@endo4life/feature-discussion';
import { useMemo, useEffect, useState } from 'react';
import { INotification } from './use-notifications';

const STORAGE_KEY = 'user_commented_resources';

/**
 * Track resources where user has commented
 */
export function useUserCommentedResources() {
  const [resources, setResources] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setResources(JSON.parse(stored));
      } catch {
        setResources([]);
      }
    }
  }, []);

  const addResource = (resourceId: string) => {
    setResources((prev) => {
      const updated = Array.from(new Set([...prev, resourceId]));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeResource = (resourceId: string) => {
    setResources((prev) => {
      const updated = prev.filter((id) => id !== resourceId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setResources([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    resources,
    addResource,
    removeResource,
    clearAll,
  };
}

/**
 * Hook to get comment notifications for resources user has commented on
 */
export function useCommentNotifications(): {
  notifications: INotification[];
  loading: boolean;
  refetch: () => void;
} {
  const { userProfile } = useAuthContext();
  const { resources } = useUserCommentedResources();
  
  // For now, we'll fetch comments for the first resource as an example
  // In a production app, you'd want to fetch comments for multiple resources
  // or have a backend endpoint that aggregates this
  const resourceId = resources[0];

  const { data: comments, loading, refetch } = useComments(
    {
      page: 0,
      size: 50,
      sort: {
        field: 'createdAt',
        order: 'DESC' as any,
      },
      query: resourceId ? { resourceId } : {},
    },
    'resourceId',
    resourceId,
  );

  const notifications = useMemo(() => {
    if (!comments || !Array.isArray(comments) || !userProfile?.id) return [];

    const notifs: INotification[] = [];

    comments.forEach((comment) => {
      // Skip if this is the user's own comment
      if (comment.createdBy === userProfile.id) {
        // Check for replies to user's comments
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach((reply) => {
            // Check if reply is from someone else and is recent (within 7 days)
            const isRecent =
              new Date().getTime() - new Date(reply.createdAt || '').getTime() <
              7 * 24 * 60 * 60 * 1000;

            if (isRecent && reply.createdBy !== userProfile.id) {
              notifs.push({
                id: `comment-${reply.id}`,
                type: 'COMMENT',
                title: 'New Reply to Your Comment',
                content:
                  reply.content?.substring(0, 100) +
                  (reply.content && reply.content.length > 100 ? '...' : ''),
                link: `/resources/${comment.resourceId}`, // Adjust link based on resource type
                createdAt: new Date(reply.createdAt || ''),
                isUnread: true,
                resourceId: resourceId,
              });
            }
          });
        }
      }
    });

    // Sort by date descending
    return notifs.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [comments, userProfile?.id, resourceId]);

  return {
    notifications,
    loading,
    refetch,
  };
}

/**
 * Helper function to call when user creates a comment
 * This should be called after successfully creating a comment
 */
export function trackUserComment(resourceId: string) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const resources: string[] = stored ? JSON.parse(stored) : [];
  
  if (!resources.includes(resourceId)) {
    resources.push(resourceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }
}

