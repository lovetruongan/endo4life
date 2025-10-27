import * as yup from 'yup';

export const useDoctorUserConversationCreateFormSchema = () => {
  return yup.object({
    attachments: yup.array().of(yup.mixed()),
    state: yup.string().required(),
    type: yup.string().required(),
    resourceId: yup.string(),
    assigneeId: yup.string(),
    parentId: yup.string(),
    content: yup.string().required("Vui lòng điền nội dung câu hỏi"),
  });
};

