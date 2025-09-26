import { useMutation, useQueryClient } from "react-query";
import { REACT_QUERY_KEYS } from "../constants";
import { CommentApiIml } from "../api";
import { ICommentCreateFormData } from "../types";

export function useCommentCreate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: ICommentCreateFormData) => {
      const api = new CommentApiIml();
      return api.createComment(data);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.CREATE_COMMENT]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}