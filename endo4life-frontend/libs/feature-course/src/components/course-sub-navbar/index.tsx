import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useLocation, Link } from 'react-router-dom';
import {
  findChildrenByName,
  isMatchedRoute,
} from '@endo4life/util-common';
import clsx from 'clsx';
import { INavItem } from '@endo4life/types';
import { useNavCourseItems } from '../../hooks';

export function CourseSubNavbar() {
  const { pathname: currentPathname } = useLocation();
  const { menuSections } = useNavCourseItems();

  const routesHasChildren = [
    {
      name: 'COURSE_DETAIL_REQUIRED_TESTS',
      path: ADMIN_WEB_ROUTES.COURSE_DETAIL_REQUIRED_TESTS,
    },
    {
      name: 'COURSE_DETAIL_LECTURES',
      path: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES,
    },
  ];

  const childrenOfCurrentPath: INavItem[] = [];

  const currentPathBelongToRoute = routesHasChildren.find((r) =>
    currentPathname.startsWith(r.path),
  );

  if (currentPathBelongToRoute) {
    const children = findChildrenByName(
      currentPathBelongToRoute.name,
      menuSections,
    );
    if (children && children.length) {
      children.forEach((c) => childrenOfCurrentPath.push(c));
    }
  }

  return (
    !!childrenOfCurrentPath.length && (
      <div className="flex p-6 bg-white border rounded-lg border-slate-100">
        {childrenOfCurrentPath.map((section) => {
          const isActive = isMatchedRoute(
            ADMIN_WEB_ROUTES,
            menuSections,
            currentPathname,
            section.link || '',
            true,
          );
          return (
            <div
              key={section.id}
              className={clsx('font-semibold text-body1 text-neutral-heading', {
                'opacity-40 pointer-events-none': section.disabled,
              })}
            >
              <Link
                key={section.label}
                to={section.link || ''}
                className={clsx({
                  'px-4 py-2 rounded-3xl': true,
                  'bg-[#2c224c] text-white': isActive,
                })}
              >
                {section.label && section.label}
              </Link>
            </div>
          );
        })}
      </div>
    )
  );
}
