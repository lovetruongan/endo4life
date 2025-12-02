import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useMount } from 'ahooks';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  useMount(() => {
    navigate(ADMIN_WEB_ROUTES.DASHBOARD);
  });
  return <div className="p-4"></div>;
}
