/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_ENDO4LIFE_SERVICE_URL: string;
  readonly VITE_ENDO4LIFE_APP_URL: string;
  readonly VITE_ENDO4LIFE_ADMIN_WEB_URL: string;
  readonly VITE_ENDO4LIFE_USER_WEB_URL: string;
  readonly VITE_ENDO4LIFE_APP_REALM: string;
  readonly VITE_ENDO4LIFE_APP_CLIENT: string;
  readonly VITE_ENDO4LIFE_USER_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
