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
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { IconType } from 'react-icons';

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
            link: ADMIN_WEB_ROUTES.IMAGES,
            icon: TbPhoto,
          },
          {
            label: t('navigation.txtMenuItemVideo'),
            link: ADMIN_WEB_ROUTES.VIDEOS,
            icon: TbVideo,
          },
          {
            label: t('navigation.txtMenuItemCourse'),
            link: ADMIN_WEB_ROUTES.COURSES,
            icon: RiPlayList2Fill,
          },
        ],
      },
      {
        id: 'common',
        children: [
          {
            label: t('navigation.txtMenuItemUser'),
            link: ADMIN_WEB_ROUTES.USERS,
            icon: VscAccount,
          },
          {
            label: t('navigation.txtMenuItemQ&A'),
            link: ADMIN_WEB_ROUTES.QUESTIONS,
            icon: TbMessage2Question,
          },
          {
            label: t('navigation.txtMenuItemDocument'),
            link: ADMIN_WEB_ROUTES.DOCUMENTS,
            icon: TbFolder,
          },
          {
            label: t('navigation.txtMenuItemComment'),
            link: ADMIN_WEB_ROUTES.COMMENTS,
            icon: TbStar,
          },
        ],
      },
    ];
    return sections;
  }, [t]);

  return { menuSections };
}
