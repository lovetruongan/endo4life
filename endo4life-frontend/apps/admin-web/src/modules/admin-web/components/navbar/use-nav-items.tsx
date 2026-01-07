import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RiPlayList2Fill } from 'react-icons/ri';
import {
  TbPhoto,
  TbVideo,
  TbMessage2Question,
  TbFolder,
  TbStar,
  TbTags,
} from 'react-icons/tb';
import { VscAccount } from 'react-icons/vsc';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { IconType } from 'react-icons';
import { useAuthContext } from '@endo4life/feature-auth';


const ROLES = {
  ADMIN: 'ADMIN',
  SPECIALIST: 'SPECIALIST',
  COORDINATOR: 'COORDINATOR',
} as const;

// Content manager roles (can manage images, videos, courses, tags)
const CONTENT_MANAGER_ROLES = [ROLES.ADMIN, ROLES.SPECIALIST];
// User manager roles (can manage users)
const USER_MANAGER_ROLES = [ROLES.ADMIN, ROLES.COORDINATOR];

export interface INavItem {
  label: string;
  link: string;
  icon: IconType;
}

export function useNavItems() {
  const { t } = useTranslation('common');
  const { userProfile } = useAuthContext();
  
  // Get user role
  const userRole = userProfile?.roles?.[0]?.toUpperCase() || '';
  
  // Check permissions
  const canManageContent = CONTENT_MANAGER_ROLES.includes(userRole as any);
  const canManageUsers = USER_MANAGER_ROLES.includes(userRole as any);
  
  const menuSections = useMemo(() => {
    const sections = [];
    
    // Content section - only for ADMIN and SPECIALIST
    if (canManageContent) {
      sections.push({
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
      });
    }
    
    // Common section - filtered by role
    const commonChildren = [];
    
    // Users - only for ADMIN and COORDINATOR
    if (canManageUsers) {
      commonChildren.push({
        label: t('navigation.txtMenuItemUser'),
        link: ADMIN_WEB_ROUTES.USERS,
        icon: VscAccount,
      });
    }
    
    // Q&A - only for ADMIN and COORDINATOR
    if (canManageUsers) {
      commonChildren.push({
        label: t('navigation.txtMenuItemQ&A'),
        link: ADMIN_WEB_ROUTES.QUESTIONS,
        icon: TbMessage2Question,
      });
    }
    
    // Documents - all staff can access
    commonChildren.push({
      label: t('navigation.txtMenuItemDocument'),
      link: ADMIN_WEB_ROUTES.DOCUMENTS,
      icon: TbFolder,
    });
    
    // Comments - only for ADMIN and COORDINATOR
    if (canManageUsers) {
      commonChildren.push({
        label: t('navigation.txtMenuItemComment'),
        link: ADMIN_WEB_ROUTES.COMMENTS,
        icon: TbStar,
      });
    }
    
    // Tags - only for ADMIN and SPECIALIST (ContentManager)
    if (canManageContent) {
      commonChildren.push({
        label: 'Tags',
        link: ADMIN_WEB_ROUTES.TAGS,
        icon: TbTags,
      });
    }
    
    if (commonChildren.length > 0) {
      sections.push({
        id: 'common',
        children: commonChildren,
      });
    }
    
    return sections;
  }, [t, canManageContent, canManageUsers]);

  return { menuSections };
}
