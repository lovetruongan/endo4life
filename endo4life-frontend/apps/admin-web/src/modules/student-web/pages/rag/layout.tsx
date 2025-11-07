import { Outlet } from 'react-router-dom';

export function RagPageLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}

export default RagPageLayout;

