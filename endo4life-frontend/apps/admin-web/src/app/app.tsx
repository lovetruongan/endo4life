import { QueryClient, QueryClientProvider } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { adminWebRouter } from '../modules/admin-web/router';
import { AuthProvider } from '@endo4life/feature-auth';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { studentWebRouter } from '../modules/student-web/router';
import {
  LOCALE_STORAGE_KEYS,
  WEB_CLIENT_ADMIN,
  WEB_CLIENT_STUDENT,
} from '@endo4life/feature-config';
import '@endo4life/feature-i18n';
import { useState, useEffect } from 'react';

const queryClient = new QueryClient();

export function App() {
  const { router } = useRouter();
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RouterProvider router={router} />
        </LocalizationProvider>
      </QueryClientProvider>
      <ToastContainer />
    </AuthProvider>
  );
}

function useRouter() {
  const [webClientId] = useState(() => {
    try {
      const item = localStorage.getItem(LOCALE_STORAGE_KEYS.WEB_CLIENT_ID);
      if (item && item === WEB_CLIENT_ADMIN) return WEB_CLIENT_ADMIN;
    } catch (error) {
      console.log('FAILED to get web client', error);
    }
    return WEB_CLIENT_STUDENT;
  });

  useEffect(() => {
    if (webClientId === WEB_CLIENT_STUDENT) {
      document.body.classList.add('theme-blue');
    } else {
      document.body.classList.remove('theme-blue');
    }
  }, [webClientId]);

  return {
    router:
      webClientId === WEB_CLIENT_ADMIN ? adminWebRouter : studentWebRouter,
  };
}

export default App;
