import { useMutation, useQueryClient } from "react-query";
import { REACT_QUERY_KEYS } from "../constants";
import { CommentApiIml } from "../api";
import { ICommentCreateFormData } from "../types";

// Track user's commented resources for notifications
function trackUserComment(resourceId?: string) {
  if (!resourceId) return;
  
  const STORAGE_KEY = 'user_commented_resources';
  const stored = localStorage.getItem(STORAGE_KEY);
  const resources: string[] = stored ? JSON.parse(stored) : [];
  
  if (!resources.includes(resourceId)) {
    resources.push(resourceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }
}

export function useCommentCreate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: ICommentCreateFormData) => {
      const api = new CommentApiIml();
      return api.createComment(data);
    },
    onSuccess(data, variables) {
      client.invalidateQueries([REACT_QUERY_KEYS.CREATE_COMMENT]);
      
      // Track this resource for future comment notifications
      trackUserComment(variables.resourceId);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}