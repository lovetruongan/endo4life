import { MouseEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToggle, useClickAway } from 'ahooks';
import EndoLogo from './endo-logo';
import { deepOrange } from '@mui/material/colors';
import { Avatar } from '@mui/material';
import { VscChevronDown, VscChevronUp } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import ProfileMenu from './profile-menu';
import clsx from 'clsx';

export default function Header() {
  const { t } = useTranslation('app');
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpened, { setLeft: setMenuOff, toggle: toggleMenu }] =
    useToggle(false);

  useClickAway((evt) => {
    const element = evt.target as HTMLElement;
    if (element && element.id !== 'profile-menu-button') {
      setMenuOff();
    }
  }, menuRef);

  const onClickMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleMenu();
  };

  return (
    <div className="flex items-center justify-between flex-none gap-4 px-8 shadow h-14">
      <Link to="/" className="flex items-center gap-6">
        <EndoLogo width={64} color="black" />
        <span className="font-bold">{t('appName')}</span>
      </Link>
      <div className="flex gap-2">
        <div className="relative">
          <button
            id="profile-menu-button"
            type="button"
            onClick={onClickMenu}
            className={clsx(
              'flex items-center justify-center h-10 gap-3 px-3 text-sm text-black rounded hover:bg-slate-100',
              { 'bg-slate-100': menuOpened },
            )}
          >
            <Avatar
              alt="avatar"
              sx={{ bgcolor: deepOrange[500], width: '28px', height: '28px' }}
              src={userProfile?.avatarLink}
            >
              {!userProfile?.avatarLink &&
                (userProfile?.firstName?.charAt(0) ||
                  userProfile?.lastName?.charAt(0) ||
                  userProfile?.email?.charAt(0)?.toUpperCase())}
            </Avatar>
            {menuOpened ? <VscChevronUp /> : <VscChevronDown />}
          </button>
          <div ref={menuRef}>
            <ProfileMenu opened={menuOpened} />
          </div>
        </div>
      </div>
    </div>
  );
}
