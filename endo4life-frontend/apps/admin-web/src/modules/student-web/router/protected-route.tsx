import { ReactNode } from 'react';
import { useAuthContext } from '@endo4life/feature-auth';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  roles?: string[];
  children?: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}