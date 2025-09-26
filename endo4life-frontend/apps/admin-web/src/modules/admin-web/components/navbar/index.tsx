import { MouseEvent, useRef } from 'react';
import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { useToggle, useClickAway } from 'ahooks';
import { VscChevronUp, VscChevronDown } from 'react-icons/vsc';
import ProfileMenu from './profile-menu';
import { useAuthContext } from '@endo4life/feature-auth';
import { useNavItems } from './use-nav-items';
import { NavMenuItem } from './nav-menu-item';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';

export default function Navbar() {
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuthContext();
  const [menuOpened, { setLeft: setMenuOff, toggle: toggleMenu }] =
    useToggle(false);

  const { menuSections } = useNavItems();

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
    <div className="flex flex-col items-center flex-none h-full gap-4 min-w-40">
      <div className="w-full px-5 py-4">
        <Link to={ADMIN_WEB_ROUTES.ROOT}>
          <img
            alt='logo'
            src="/images/logo.png"
            className="flex-none w-10 h-10"
            title="imageinput"
          />
        </Link>
      </div>

      <section className="px-5">
        {menuSections.map((section, idx) => {
          return (
            <div key={section.id}>
              {idx > 0 && (
                <div className="px-3 py-6">
                  <div className="w-full border-b border-neutral-border"></div>
                </div>
              )}
              {section.label && (
                <h2 className="px-3 py-2 font-semibold text-body1 text-neutral-heading">
                  {section.label}
                </h2>
              )}
              <ul>
                {section.children.map((menuItem) => {
                  const isActive = location.pathname.startsWith(menuItem.link);

                  return (
                    <NavMenuItem
                      key={menuItem.link}
                      menuItem={menuItem}
                      isActive={isActive}
                    />
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <div className="flex-auto" />

      <div className="relative w-full p-5">
        <button
          id="profile-menu-button"
          type="button"
          onClick={onClickMenu}
          className={clsx(
            'flex items-center h-10 gap-3 text-sm text-black rounded hover:bg-slate-100 w-full',
            { 'bg-slate-100': menuOpened }
          )}
        >
          <Avatar
            alt="avatar"
            sx={{
              bgcolor: '#ccc',
              width: '28px',
              height: '28px',
            }}
          />
          <span className="text-left">
            {userProfile?.lastName} {userProfile?.firstName}
          </span>
          {menuOpened ? <VscChevronUp /> : <VscChevronDown />}
        </button>
        <div ref={menuRef}>
          <ProfileMenu opened={menuOpened} />
        </div>
      </div>
    </div>
  );
}
