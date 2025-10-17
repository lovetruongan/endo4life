import { INavItem } from '@endo4life/types';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface HeaderMenuItemProps {
  menuItem: INavItem;
  isActive: boolean;
}

export function HeaderMenuItem({ menuItem, isActive }: HeaderMenuItemProps) {
  return (
    <Link key={menuItem.label} to={menuItem.link || '/'}>
      <li
        key={menuItem.label}
        className={clsx(
          'flex items-center rounded-lg relative'
        )}
      >
        <span
          className={clsx('flex-auto font-medium text-body1', {
            'text-primary font-semibold': isActive,
            'text-neutral-text font-medium': !isActive,
          })}
        >
          {menuItem.label}
        </span>
      </li>
    </Link>
  );
}
