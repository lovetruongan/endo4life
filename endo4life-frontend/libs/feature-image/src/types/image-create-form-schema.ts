import { ResourceState, UploadType } from "@endo4life/data-access";
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

export const useImageCreateFormSchema = () => {
  const { t } = useTranslation(['common', 'image']);

  return yup.object({
    type: yup.string().default(UploadType.Multiple),
    files: yup.mixed(),
    metadata: yup.array().of(
      yup.object({
        title: yup
          .string()
          .required(
            t('common:txtRequiredField').replace(
              '{{field_name}}',
              "Tiêu đề"
            )
          ),
        description: yup.string(),
        state: yup.string().default(ResourceState.Unlisted),
        tag: yup.array().of(yup.string()),
        detailTag: yup.array().of(yup.string()),
      })
    ),
  });
};
