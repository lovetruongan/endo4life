import Keycloak from 'keycloak-js';

// Inline env config to avoid cross-library dependency
const getEnvConfig = () => ({
  url: (import.meta as any).env?.VITE_ENDO4LIFE_APP_URL || '',
  realm: (import.meta as any).env?.VITE_ENDO4LIFE_APP_REALM || 'endo4life',
  clientId: (import.meta as any).env?.VITE_ENDO4LIFE_APP_CLIENT || 'endo4life_app',
});

// Setup Keycloak instance for Endo4Life
const config = getEnvConfig();
const keycloak = new Keycloak({
  url: config.url,
  realm: config.realm,
  clientId: config.clientId,
});

export default keycloak;
