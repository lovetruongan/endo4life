import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@endo4life/feature-auth';

// Role constants matching backend
export const ROLES = {
  ADMIN: 'ADMIN',
  SPECIALIST: 'SPECIALIST',
  COORDINATOR: 'COORDINATOR',
  CUSTOMER: 'CUSTOMER',
} as const;

// Staff roles (can access admin panel)
export const STAFF_ROLES = [ROLES.ADMIN, ROLES.SPECIALIST, ROLES.COORDINATOR];

// Content manager roles
export const CONTENT_MANAGER_ROLES = [ROLES.ADMIN, ROLES.SPECIALIST];

// User manager roles
export const USER_MANAGER_ROLES = [ROLES.ADMIN, ROLES.COORDINATOR];

interface Props {
  roles?: string[];
  children?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  roles = STAFF_ROLES, // Default: only staff can access admin routes
  children,
  redirectTo = '/login',
}: Props) {
  const { userProfile, isAuthenticated } = useAuthContext();

  // Not authenticated
  if (!isAuthenticated || !userProfile) {
    return <Navigate to={redirectTo} replace />;
  }

  // Get user's role (first role in array)
  const userRole = userProfile.roles?.[0]?.toUpperCase();

  // If no roles specified, allow all authenticated users
  if (!roles || roles.length === 0) {
    return children as React.ReactElement;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = roles.some((role) => role.toUpperCase() === userRole);

  if (!hasRequiredRole) {
    // User doesn't have permission - redirect to unauthorized or home
    console.warn(
      `Access denied. User role: ${userRole}, Required: ${roles.join(', ')}`,
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return children as React.ReactElement;
}
