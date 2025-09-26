import { useLocation } from 'react-router-dom';
import { NavCourseMenuItem } from './nav-course-menu-item';
import { isMatchedRoute } from '@endo4life/util-common';
import { useNavCourseItems } from '../../hooks';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { INavItem } from '@endo4life/types';

export function CourseNavbar() {
  const { pathname } = useLocation();
  const { menuSections } = useNavCourseItems();

  return (
    <div className="flex items-center bg-white border-b-2 rounded-t-2xl border-slate-100">
      {menuSections.map((section) => {
        return (
          <div key={section.id}>
            {section.label && (
              <h2 className="px-3 py-2 font-semibold text-body1 text-neutral-heading">
                {section.label}
              </h2>
            )}
            <ul className="flex">
              {(section.children || []).map((menuItem: INavItem) => {
                const isActive = isMatchedRoute(
                  ADMIN_WEB_ROUTES,
                  menuSections,
                  pathname,
                  menuItem.path || '',
                );
                return (
                  <NavCourseMenuItem
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
    </div>
  );
}
