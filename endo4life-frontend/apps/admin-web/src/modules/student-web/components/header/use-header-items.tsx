import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';

export function useHeaderItems() {
  const { t } = useTranslation('common');

  const menuSections = useMemo(() => {
    const sections = [
      {
        id: 'common',
        children: [
          {
            id: 'common1',
            label: t('navigation.txtHome'),
            name: 'ROOT',
            link: STUDENT_WEB_ROUTES.ROOT,
          },
          {
            id: 'common2',
            label: t('navigation.txtResources'),
            name: 'RESOURCES',
            link: STUDENT_WEB_ROUTES.RESOURCES,
            isAuthRequired: true,
          },
          {
            id: 'common3',
            label: t('navigation.txtMyLearning'),
            name: 'MY_LEARNING',
            link: STUDENT_WEB_ROUTES.MY_LEARNING,
            isAuthRequired: true,
          },
          {
            id: 'common4',
            label: t('navigation.txtMyLibrary'),
            name: 'MY_LIBRARY',
            link: STUDENT_WEB_ROUTES.MY_LIBRARY,
            isAuthRequired: true,
          },
          {
            id: 'common5',
            label: 'AI Assistant',
            name: 'RAG',
            link: STUDENT_WEB_ROUTES.RAG_ASK,
            isAuthRequired: true,
          },
          {
            id: 'common6',
            label: t('navigation.txtAboutUs'),
            name: 'ABOUT_US',
            link: STUDENT_WEB_ROUTES.ABOUT_US,
          },
        ],
      },
    ];
    return sections;
  }, [t]);

  return { menuSections };
}
