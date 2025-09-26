import { EnvConfig } from '@endo4life/feature-config';
import Keycloak from 'keycloak-js';

// Setup Keycloak instance for Endo4Life
const keycloak = new Keycloak({
  url: EnvConfig.Endo4LifeUrl,
  realm: EnvConfig.Endo4LifeRealm || 'endo4life',
  clientId: EnvConfig.Endo4LifeClient || 'endo4life_app',
});

export default keycloak;
