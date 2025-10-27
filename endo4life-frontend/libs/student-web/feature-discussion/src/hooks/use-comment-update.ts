import { useMutation, useQueryClient } from "react-query";
import { REACT_QUERY_KEYS } from "../constants";
import { CommentApiIml } from "../api";
import { ICommentUpdateFormData } from "../types";

export function useCommentUpdate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ICommentUpdateFormData }) => {
      const api = new CommentApiIml();
      return api.updateComment(id, data);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.COMMENTS]);
      client.invalidateQueries([REACT_QUERY_KEYS.UPDATE_COMMENT]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}

