import * as yup from 'yup';

export const useCommentCreateFormSchema = () => {
  return yup.object({
    attachments: yup.array().of(yup.mixed()),
    resourceId: yup.string(),
    courseId: yup.string(),
    parentId: yup.string(),
    content: yup.string().required("Vui lòng điền nội dung bình luận"),
    userInfoId: yup.string(),
  });
};
