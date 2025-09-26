import { ReactNode } from 'react';

interface Props {
  roles: string[];
  children?: ReactNode;
}
export function ProtectedRoute({ children }: Props) {
  return children;
}
