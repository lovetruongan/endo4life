import { useMutation, useQueryClient } from "react-query";
import { REACT_QUERY_KEYS } from "../constants";
import { DoctorUserConversationApiImpl } from "../api";
import { IDoctorUserConversationCreateFormData } from "../types";

export function useDoctorUserConversationCreate() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: IDoctorUserConversationCreateFormData) => {
      const api = new DoctorUserConversationApiImpl();
      return api.createDoctorUserConversation(data);
    },
    onSuccess(data) {
      client.invalidateQueries([REACT_QUERY_KEYS.CREATE_DOCTOR_USER_CONVERSATION]);
    },
    onError(error) {
      console.log('error', error);
    },
  });

  return { mutation };
}

