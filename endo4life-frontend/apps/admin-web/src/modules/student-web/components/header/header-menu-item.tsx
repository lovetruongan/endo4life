import { INavItem } from '@endo4life/types';
import { useAuthContext } from '@endo4life/feature-auth';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import { MdLock } from 'react-icons/md';

interface HeaderMenuItemProps {
  menuItem: INavItem;
  isActive: boolean;
}

export function HeaderMenuItem({ menuItem, isActive }: HeaderMenuItemProps) {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const isAuthRequired = (menuItem as any).isAuthRequired;
  const needsAuth = isAuthRequired && !isAuthenticated;

  const handleClick = (e: React.MouseEvent) => {
    if (needsAuth) {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: menuItem.link } } });
    }
  };

  return (
    <Link 
      key={menuItem.label} 
      to={menuItem.link || '/'}
      onClick={handleClick}
      className="relative group"
    >
      <li
        key={menuItem.label}
        className={clsx(
          'flex items-center gap-2 rounded-lg relative px-3 py-2 transition-all duration-200',
          {
            'bg-primary-50': isActive,
            'hover:bg-gray-50': !isActive && !needsAuth,
            'hover:bg-primary-50': !isActive && needsAuth,
          }
        )}
      >
        <span
          className={clsx('flex-auto font-medium text-body1', {
            'text-primary-600 font-semibold': isActive,
            'text-neutral-text': !isActive && !needsAuth,
            'text-primary-500': !isActive && needsAuth,
          })}
        >
          {menuItem.label}
        </span>
        
        {needsAuth && (
          <MdLock 
            size={16} 
            className="text-primary-400 group-hover:text-primary-600 transition-colors" 
          />
        )}
      </li>
    </Link>
  );
}
