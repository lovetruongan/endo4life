import { INavItem } from '@endo4life/types';
import { matchRoutes } from 'react-router-dom';

export const isMatchedRoute = (
  ADMIN_WEB_ROUTES: object,
  menuSections: INavItem[],
  currentPath: string,
  comparedPath: string,
  isSubCompared: boolean = false,
): boolean => {
  const allRoutes = Object.keys(ADMIN_WEB_ROUTES).map((key: string) => ({
    name: key,
    path: ADMIN_WEB_ROUTES[key as keyof typeof ADMIN_WEB_ROUTES]
  }));

  const matches = matchRoutes(allRoutes, currentPath, "/");
  if (!matches || !matches.length) {
    return false;
  }

  const matchedPath = matches[0].route.path as string;

  // Case 1: Direct comparison when not a sub-comparison
  if (!isSubCompared) {
    if (matchedPath === comparedPath) {
      return true;
    }

    // Check if the currentPath starts with comparedPath and belongs to its children
    const childrenOfComparedPath = findChildrenByPath(comparedPath, menuSections) || [];
    return matchedPath.startsWith(comparedPath) &&
      childrenOfComparedPath.some(child => child.link === currentPath);
  }

  // Case 2: Direct comparison when it's a sub-comparison
  return matchedPath === comparedPath;
}

export const findChildrenByName = (name: string, items: INavItem[]): INavItem[] | undefined => {
  for (const item of items) {
    if (item.name === name) {
      return item.children;
    }
    if (item.children) {
      const found = findChildrenByName(name, item.children);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

export const findChildrenByPath = (path: string, items: INavItem[]): INavItem[] | undefined => {
  for (const item of items) {
    if (item.link == path) {
      return item.children;
    }
    if (item.children) {
      const found = findChildrenByPath(path, item.children);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}
