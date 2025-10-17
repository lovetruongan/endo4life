import { ResourceState } from "@endo4life/data-access";
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

export const useImageDetailFormSchema = () => {
  const { t } = useTranslation(['common', 'image']);

  return yup.object({
    file: yup.mixed(),
    metadata: yup.object({
      title: yup
        .string()
        .required(
          t('common:txtRequiredField').replace('{{field_name}}', t('Tiêu đề'))
        ),
      description: yup.string(),
      state: yup.string().default(ResourceState.Unlisted),
      tag: yup.array().of(yup.string()),
      detailTag: yup.array().of(yup.string()),
    }),
    compressedFile: yup.object(),
  });
};
