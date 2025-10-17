import { ReactNode } from 'react';

interface Props {
  roles: string[];
  children?: ReactNode;
}
export function ProtectedRoute({ roles, children }: Props) {
  return <>{children}</>;
}
