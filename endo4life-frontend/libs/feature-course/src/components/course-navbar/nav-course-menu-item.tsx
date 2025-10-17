import { INavItem } from '@endo4life/types';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface NavCourseMenuItemProps {
  menuItem: INavItem;
  isActive: boolean;
}

export function NavCourseMenuItem({
  menuItem,
  isActive,
}: NavCourseMenuItemProps) {
  return (
    <Link
      className={clsx({ 'opacity-40 pointer-events-none': menuItem.disabled })}
      key={menuItem.label}
      to={menuItem.link || ''}
    >
      <li
        key={menuItem.label}
        className={clsx({
          'flex items-center gap-2 px-3 py-4 relative justify-center text-center':
            true,
          'border-b-2 border-primary': isActive,
        })}
      >
        <span
          className={clsx('flex-auto min-w-40 text-body1 font-semibold', {
            'text-primary text-md': isActive,
            'text-neutral-text': !isActive,
          })}
        >
          {menuItem.label}
        </span>
      </li>
    </Link>
  );
}
