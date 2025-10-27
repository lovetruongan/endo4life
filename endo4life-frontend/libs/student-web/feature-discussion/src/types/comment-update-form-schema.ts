import * as yup from 'yup';

export const useCommentUpdateFormSchema = () => {
  return yup.object({
    attachments: yup.array().of(yup.mixed()),
    content: yup.string().required("Vui lòng điền nội dung bình luận"),
  });
};

