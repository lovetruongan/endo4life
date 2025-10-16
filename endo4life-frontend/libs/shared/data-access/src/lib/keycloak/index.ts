import Keycloak from "keycloak-js";

const TOKEN_EXPIRED_MIN_VALIDITY = 1 * 60; // 1 min
const TOKEN_EXPIRED_UPDATE_DURATION = 1 * 60 * 60; // 1 hour

let _keycloak: Keycloak | undefined = undefined;

function setKeycloak(instance?: Keycloak) {
  _keycloak = instance;
}

function getAccessToken() {
  return _keycloak?.token ?? "";
}

async function refreshToken() {
  const isExpired = isTokenExpired(TOKEN_EXPIRED_MIN_VALIDITY);
  if (isExpired) {
    await _keycloak?.updateToken(TOKEN_EXPIRED_UPDATE_DURATION);
  }
  return getAccessToken();
}

function isTokenExpired(minValidity: number = 0) {
  if (!_keycloak || !_keycloak.tokenParsed) {
    return true;
  }
  
  const expiresIn = _keycloak.tokenParsed['exp'] 
    ? _keycloak.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) 
    : 0;
  
  return expiresIn < minValidity;
}

function dispose() {
  _keycloak = undefined;
}

export const keycloakUtils = {
  setKeycloak,
  getAccessToken,
  refreshToken,
  dispose,
};

// Export keycloak config
export { default as keycloak } from './keycloak-config';