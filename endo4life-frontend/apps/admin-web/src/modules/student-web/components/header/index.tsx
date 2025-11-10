import { useAuthContext } from '@endo4life/feature-auth';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { INavItem } from '@endo4life/types';
import { Avatar, Badge, IconButton, Drawer } from '@mui/material';
import { useClickAway } from 'ahooks';
import clsx from 'clsx';
import { MouseEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdLogin, MdMenu, MdClose } from 'react-icons/md';
import { VscBell, VscChevronDown, VscChevronUp } from 'react-icons/vsc';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { HeaderMenuItem } from './header-menu-item';
import NotificationMenu from './notification-menu';
import ProfileMenu from './profile-menu';
import { useHeaderItems } from './use-header-items';
import { useNameInitial } from '@endo4life/feature-user';
import { useNotifications } from '../../hooks/use-notifications';

const MENUS = {
  PROFILE: 'profile',
  NOTIFICATION: 'notification',
} as const;

export default function Header() {
  const { t } = useTranslation('app');
  const { isAuthenticated, userProfile } = useAuthContext();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { menuSections } = useHeaderItems();
  const firstCharacterName = useNameInitial(userProfile);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  useClickAway(
    (evt) => {
      setOpenMenu(null);
    },
    [menuRef, notificationRef],
  );

  const onClickMenu = (event: MouseEvent<HTMLElement>, menuType: string) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenMenu(openMenu === menuType ? null : menuType);
  };

  const isActiveMenu = (menuItem: INavItem) => {
    const link = menuItem.link;
    if (!link) return false;
    if (link === '/') return location.pathname === link;
    return matchPath({ path: link, end: false }, location.pathname) !== null;
  };

  return (
    <div className="flex items-center justify-between px-4 shadow-sm h-14">
      <div className="flex items-center">
        {/* Mobile Menu Sections */}
        <div className="md:hidden">
          <IconButton
            sx={{ paddingLeft: 0 }}
            onClick={() => setMobileMenuOpen(true)}
          >
            {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </IconButton>

          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          >
            <div className="p-6 w-64">
              {menuSections.map((section) => (
                <div key={section.id} className="mb-4">
                  <ul className="flex flex-col gap-6">
                    {section.children.map((menuItem) => (
                      <div
                        key={menuItem.link}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <HeaderMenuItem
                          menuItem={menuItem}
                          isActive={isActiveMenu(menuItem)}
                        />
                      </div>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Drawer>
        </div>

        <Link to={STUDENT_WEB_ROUTES.ROOT}>
          <img
            alt="logo"
            src="/images/logo.png"
            className="flex-none w-10 h-10 mr-4"
            title="logo"
          />
        </Link>

        {/* Desktop Menu Sections */}
        <div className="hidden md:flex items-center gap-6">
          {menuSections.map((section) => (
            <div key={section.id}>
              <ul className="flex items-center gap-6">
                {section.children.map((menuItem) => (
                  <HeaderMenuItem
                    key={menuItem.link}
                    menuItem={menuItem}
                    isActive={isActiveMenu(menuItem)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-2">
          {/* My Questions Button */}
          <Link
            to={STUDENT_WEB_ROUTES.MY_QUESTIONS}
            className={clsx(
              'hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <span>Câu hỏi của tôi</span>
          </Link>

          {/* Notification Button */}
          <div className="relative">
            <button
              id="notification-button"
              type="button"
              onClick={(e) => onClickMenu(e, MENUS.NOTIFICATION)}
              className={clsx('hover:bg-slate-200 rounded-full p-2', {
                'bg-slate-200': openMenu === MENUS.NOTIFICATION,
              })}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                invisible={unreadCount === 0}
              >
                <VscBell size={20} color="gray" />
              </Badge>
            </button>
            <div ref={notificationRef}>
              <NotificationMenu 
                opened={openMenu === MENUS.NOTIFICATION}
                notifications={notifications}
                loading={loading}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
              />
            </div>
          </div>

          <div className="relative">
            <button
              id="profile-menu-button"
              type="button"
              onClick={(e) => onClickMenu(e, MENUS.PROFILE)}
              className={clsx(
                'flex items-center justify-center h-10 gap-2 ms-4 px-2 py-1 text-sm text-black rounded hover:bg-slate-100',
                { 'bg-slate-200': openMenu === MENUS.PROFILE },
              )}
            >
              <Avatar
                alt="avatar"
                src={userProfile?.avatarLink}
                sx={{ width: 28, height: 28 }}
              >
                {firstCharacterName}
              </Avatar>
              {openMenu === MENUS.PROFILE ? (
                <VscChevronUp />
              ) : (
                <VscChevronDown />
              )}
            </button>
            <div ref={menuRef}>
              <ProfileMenu opened={openMenu === MENUS.PROFILE} />
            </div>
          </div>
        </div>
      )}

{!isAuthenticated && (
        <div className="flex items-center">
          <Link
            to="/login"
            state={{ from: { pathname: '/' } }}
            className="flex items-center gap-2 text-md text-slate-700 font-medium hover:text-slate-500"
          >
            {t('accountMenu.textLogin')}
            <MdLogin />
          </Link>
        </div>
      )}
    </div>
  );
}
