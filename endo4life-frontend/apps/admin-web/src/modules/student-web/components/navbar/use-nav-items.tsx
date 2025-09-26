import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RiPlayList2Fill } from 'react-icons/ri';
import {
  TbPhoto,
  TbVideo,
  TbMessage2Question,
  TbFolder,
  TbStar,
} from 'react-icons/tb';
import { VscAccount } from 'react-icons/vsc';
import { IconType } from 'react-icons';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';

export interface INavItem {
  label: string;
  link: string;
  icon: IconType;
}

export function useNavItems() {
  const { t } = useTranslation('common');
  const menuSections = useMemo(() => {
    const sections = [
      {
        id: 'content',
        label: t('navigation.sectionContentLabel'),
        children: [
          {
            label: t('navigation.txtMenuItemImage'),
            link: STUDENT_WEB_ROUTES.HOME,
            icon: TbPhoto,
          },
          {
            label: t('navigation.txtMenuItemVideo'),
            link: STUDENT_WEB_ROUTES.HOME,
            icon: TbVideo,
          },
          {
            label: t('navigation.txtMenuItemCourse'),
            link: STUDENT_WEB_ROUTES.HOME,
            icon: RiPlayList2Fill,
          },
        ],
      },
      {
        id: 'common',
        children: [
          {
            label: t('navigation.txtMenuItemUser'),
            link: STUDENT_WEB_ROUTES.HOME,
            icon: VscAccount,
          },
          {
            label: t('navigation.txtMenuItemQ&A'),
            link: STUDENT_WEB_ROUTES.HOME,
            icon: TbMessage2Question,
          },
          {
            label: t('navigation.txtMenuItemDocument'),
            link: STUDENT_WEB_ROUTES.HOME,
            icon: TbFolder,
          },
          {
            label: t('navigation.txtMenuItemComment'),
            link: STUDENT_WEB_ROUTES.HOME,
            icon: TbStar,
          },
        ],
      },
    ];
    return sections;
  }, [t]);

  return { menuSections };
}
