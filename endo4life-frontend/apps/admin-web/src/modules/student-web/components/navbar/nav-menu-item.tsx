import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { INavItem } from './use-nav-items';

interface NavMenuItemProps {
  menuItem: INavItem;
  isActive: boolean;
}

export function NavMenuItem({ menuItem, isActive }: NavMenuItemProps) {
  const Icon = menuItem.icon;
  return (
    <Link key={menuItem.label} to={menuItem.link}>
      <li
        key={menuItem.label}
        className={clsx(
          'flex items-center gap-2 px-3 py-3 my-1 rounded-lg relative',
          {
            'bg-neutral-background-layer': isActive,
          }
        )}
      >
        <span className="flex-none">
          <Icon
            size="20"
            className={clsx({
              'text-primary': isActive,
              'text-neutral-text': !isActive,
            })}
          />
        </span>
        <span
          className={clsx('flex-auto min-w-40 text-body1', {
            'text-primary font-semibold': isActive,
            'text-neutral-text': !isActive,
          })}
        >
          {menuItem.label}
        </span>
        {isActive && (
          <div className="absolute left-0 z-10 w-1 h-6 transform -translate-y-1/2 rounded bg-icon top-1/2"></div>
        )}
      </li>
    </Link>
  );
}
