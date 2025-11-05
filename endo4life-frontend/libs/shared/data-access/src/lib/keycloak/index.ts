import Keycloak from "keycloak-js";
import { EnvConfig } from "@endo4life/feature-config";

const TOKEN_EXPIRED_MIN_VALIDITY = 1 * 60; // 1 min
const TOKEN_EXPIRED_UPDATE_DURATION = 1 * 60 * 60; // 1 hour

let _keycloak: Keycloak | undefined = undefined;

function setKeycloak(instance?: Keycloak) {
  _keycloak = instance;
}

function getAccessToken() {
  return _keycloak?.token ?? "";
}

// Storage keys must match auth-provider/login implementations
const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'endo4life_access_token',
  REFRESH_TOKEN: 'endo4life_refresh_token',
  TOKEN_EXPIRY: 'endo4life_token_expiry',
};

function getStoredTokens() {
  return {
    token: localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) || "",
    refreshToken: localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN) || "",
    expiry: localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY),
  };
}

function setStoredTokens(token: string, refreshToken: string, expiresIn?: number) {
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  if (expiresIn) {
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, String(expiryTime));
  }
}

function decodeJwt(token?: string): any | undefined {
  if (!token) return undefined;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return undefined;
  }
}

async function refreshToken() {
  // If we have a real keycloak-js instance with updateToken, use it.
  if (_keycloak && typeof ([_keycloak] as any)[0]?.updateToken === 'function') {
    const isExpired = isTokenExpired(TOKEN_EXPIRED_MIN_VALIDITY);
    if (isExpired) {
      await ([_keycloak] as any)[0].updateToken(TOKEN_EXPIRED_UPDATE_DURATION);
    }
    return getAccessToken();
  }

  // Fallback: use stored tokens and refresh via OIDC endpoint when needed.
  const { token, refreshToken: rToken, expiry } = getStoredTokens();

  // If token exists and not expired, just return it
  if (token && expiry && Date.now() < Number(expiry) - TOKEN_EXPIRED_MIN_VALIDITY * 1000) {
    return token;
  }

  // Try refresh
  if (rToken) {
    const url = `${EnvConfig.Endo4LifeUrl}/realms/${EnvConfig.Endo4LifeRealm}/protocol/openid-connect/token`;
    const body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('client_id', EnvConfig.Endo4LifeClient);
    if (EnvConfig.Endo4LifeClientSecret) {
      body.append('client_secret', EnvConfig.Endo4LifeClientSecret);
    }
    body.append('refresh_token', rToken);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (res.ok) {
        const json = await res.json();
        const newToken = json.access_token as string;
        const newRefresh = (json.refresh_token as string) || rToken;
        const expiresIn = (json.expires_in as number) ?? 300;

        // Update storage
        setStoredTokens(newToken, newRefresh, expiresIn);

        // Update in-memory instance if present
        if (_keycloak) {
          (_keycloak as any).token = newToken;
          (_keycloak as any).refreshToken = newRefresh;
          (_keycloak as any).tokenParsed = decodeJwt(newToken);
        }
        return newToken;
      }
    } catch {
      // ignore and fall through
    }
  }

  // As a last resort, return whatever we have (may be empty); caller can handle 401
  return token || getAccessToken();
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