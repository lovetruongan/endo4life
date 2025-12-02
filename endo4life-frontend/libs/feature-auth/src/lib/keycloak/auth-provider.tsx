import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ReactNode } from 'react';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { KeycloakLoading } from './KeycloakLoading';
import { LoginRequired } from './LoginRequired';
import { LoginForm } from './login-form';
import axios from 'axios';
import {
  keycloakUtils,
  UserInfoState,
  UserResponseDto,
} from '@endo4life/data-access';
import {
  ADMIN_WEB_ROUTES,
  EnvConfig,
  LOCALE_STORAGE_KEYS,
  STUDENT_WEB_ROUTES,
  WEB_CLIENT_ADMIN,
  WEB_CLIENT_STUDENT,
} from '@endo4life/feature-config';
import { stringUtils } from '@endo4life/util-common';

// Authentication storage keys
const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'endo4life_access_token',
  REFRESH_TOKEN: 'endo4life_refresh_token',
  TOKEN_EXPIRY: 'endo4life_token_expiry',
  USER_PROFILE: 'endo4life_user_profile',
};

export interface KeycloakUserProfile extends KeycloakProfile {
  [key: string]: unknown;
  username?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roles?: string[];
  userId?: string;
  name?: string;
  avatarLink?: string;
}

export type IUserProfile = KeycloakUserProfile;

interface AuthState {
  isAuthenticated: boolean;
  userProfile?: IUserProfile;
  logout: () => void;
  updateUserInfo: (profile: UserResponseDto) => void;
  changeWebClientId: (newClientId: string) => void;
}

const AuthContext = createContext({} as AuthState);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children?: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [keycloak, setKeycloak] = useState<Keycloak>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [userProfile, setUserProfile] = useState<KeycloakUserProfile>();
  const [useDirectLogin] = useState(true); // Set to true for direct login, false for redirect

  // Helper functions for token management
  const saveTokensToStorage = (token: string, refreshToken: string, expiresIn?: number) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000; // Convert to milliseconds
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    }
  };

  const getTokensFromStorage = () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const expiry = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);

    return { token, refreshToken, expiry };
  };

  const clearTokensFromStorage = () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_PROFILE);
  };

  const isTokenExpired = (expiry: string | null) => {
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  };

  const saveUserProfileToStorage = (profile: KeycloakUserProfile) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  };

  const getUserProfileFromStorage = (): KeycloakUserProfile | null => {
    const profileStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER_PROFILE);
    if (!profileStr) return null;
    try {
      return JSON.parse(profileStr);
    } catch {
      return null;
    }
  };

  const loadUserProfile = async (keycloakInstance: Keycloak) => {
    const keycloakProfile = await keycloakInstance.loadUserProfile();
    let newUserProfile: KeycloakUserProfile = {
      ...keycloakProfile,
    } as KeycloakUserProfile;

    const parsedToken = keycloakInstance.tokenParsed;
    if (parsedToken) {
      newUserProfile = {
        ...newUserProfile,
        userId: newUserProfile.id,
        roles: parsedToken.realm_access?.roles,
      };
    }

    const userInfo = await axios.get(`${EnvConfig.UserServiceUrl}/info`, {
      headers: {
        Authorization: `Bearer ${keycloakInstance.token}`,
      },
    });

    console.log(userInfo);

    newUserProfile = {
      ...newUserProfile,
      username: userInfo?.data?.username,
      firstName: userInfo?.data?.firstName,
      lastName: userInfo?.data?.lastName,
      email: userInfo?.data?.email,
      phoneNumber: userInfo?.data?.phoneNumber,
      roles: [stringUtils.defaultString(userInfo?.data?.role?.toString())],
      userId: newUserProfile.id,
      id: userInfo?.data?.id,
      avatarLink: userInfo?.data?.avatarLink,
      isActive:
        userInfo?.data?.status === UserInfoState.Inactive.toString()
          ? false
          : true,
    };
    setUserProfile(newUserProfile);
  };

  const handleDirectLogin = async (token: string, refreshToken: string, expiresIn?: number) => {
    try {
      console.log('Starting direct login with token...');
      setIsAuthenticating(true);

      // Decode the token to get user info
      const tokenParts = token.split('.');
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload:', tokenPayload);

      // Create user profile from token
      const newUserProfile: KeycloakUserProfile = {
        id: tokenPayload.sub,
        username:
          tokenPayload.preferred_username || tokenPayload.name || 'user',
        firstName: tokenPayload.given_name || '',
        lastName: tokenPayload.family_name || '',
        email: tokenPayload.email || '',
        roles: tokenPayload.realm_access?.roles || ['user'],
        userId: tokenPayload.sub,
        isActive: true,
      } as KeycloakUserProfile;

      setUserProfile(newUserProfile);
      console.log('User profile from token:', newUserProfile);

      // Create a minimal Keycloak instance for compatibility
      const keycloakInstance = {
        token,
        refreshToken,
        authenticated: true,
        tokenParsed: tokenPayload,
        logout: () => {
          window.location.href = `${EnvConfig.Endo4LifeUrl}/realms/${EnvConfig.Endo4LifeRealm}/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;
        },
      } as any;

      // Save tokens to localStorage for session persistence
      saveTokensToStorage(token, refreshToken, expiresIn);
      saveUserProfileToStorage(newUserProfile);

      setIsAuthenticated(true);
      setKeycloak(keycloakInstance);
      keycloakUtils.setKeycloak(keycloakInstance);
      console.log('Authentication successful! Tokens saved to storage.');

      // Try to load additional user info from backend (optional)
      // This is non-blocking - app will work even if this fails
      axios
        .get(`${EnvConfig.UserServiceUrl}/api/v1/users/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log('User info from backend:', response.data);
          // Update profile with backend data if available
          const updatedProfile = {
            ...newUserProfile,
            ...response.data,
          };
          setUserProfile(updatedProfile);
        })
        .catch((error) => {
          console.log(
            'Could not load user info from backend (non-critical):',
            error.message,
          );
        });
    } catch (error) {
      console.error('Direct login error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    const initKeycloak = async () => {
      setIsAuthenticating(true);

      if (useDirectLogin) {
        // Try to restore session from localStorage
        console.log('Checking for existing session...');
        const { token, refreshToken, expiry } = getTokensFromStorage();

        if (token && refreshToken) {
          // Check if token is still valid
          if (!isTokenExpired(expiry)) {
            console.log('Found valid session, restoring...');

            // Restore user profile from storage
            const savedProfile = getUserProfileFromStorage();
            if (savedProfile) {
              setUserProfile(savedProfile);
            }

            // Create Keycloak instance
            const tokenParts = token.split('.');
            const tokenPayload = JSON.parse(atob(tokenParts[1]));

            const keycloakInstance = {
              token,
              refreshToken,
              authenticated: true,
              tokenParsed: tokenPayload,
              logout: () => {
                window.location.href = `${EnvConfig.Endo4LifeUrl}/realms/${EnvConfig.Endo4LifeRealm}/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;
              },
            } as any;

            setIsAuthenticated(true);
            setKeycloak(keycloakInstance);
            keycloakUtils.setKeycloak(keycloakInstance);
            console.log('Session restored successfully!');
          } else {
            console.log('Token expired, clearing storage...');
            clearTokensFromStorage();
          }
        } else {
          console.log('No existing session found.');
        }

        setIsAuthenticating(false);
        return;
      }

      // Original redirect-based flow
      const keycloakInstance = new Keycloak({
        url: EnvConfig.Endo4LifeUrl,
        realm: EnvConfig.Endo4LifeRealm,
        clientId: EnvConfig.Endo4LifeClient,
      });

      const result = await keycloakInstance.init({
        onLoad: 'login-required',
        checkLoginIframe: false, // Disable iframe checking for better reliability
      });

      if (result) {
        await loadUserProfile(keycloakInstance);
      }

      setIsAuthenticated(result);
      setIsAuthenticating(false);
      setKeycloak(keycloakInstance);
      keycloakUtils.setKeycloak(keycloakInstance);
    };

    initKeycloak();
  }, [useDirectLogin]);

  // Listen for storage changes (after login from another tab or after login success)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage changed, checking for new session...');
      const { token, refreshToken, expiry } = getTokensFromStorage();

      if (token && refreshToken && !isTokenExpired(expiry)) {
        const savedProfile = getUserProfileFromStorage();
        if (savedProfile && !isAuthenticated) {
          console.log('New session detected, restoring...');

          const tokenParts = token.split('.');
          const tokenPayload = JSON.parse(atob(tokenParts[1]));

          const keycloakInstance = {
            token,
            refreshToken,
            authenticated: true,
            tokenParsed: tokenPayload,
            logout: () => {
              window.location.href = `${EnvConfig.Endo4LifeUrl}/realms/${EnvConfig.Endo4LifeRealm}/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;
            },
          } as any;

          setUserProfile(savedProfile);
          setIsAuthenticated(true);
          setKeycloak(keycloakInstance);
          keycloakUtils.setKeycloak(keycloakInstance);
          console.log('Session restored from storage event!');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  const updateUserInfo = (profile: UserResponseDto) => {
    setUserProfile({
      ...userProfile,
      phoneNumber: profile.phoneNumber,
      state: profile.state,
      role: profile.role,
      lastName: profile.lastName,
      firstName: profile.firstName,
      avatarLink: profile.avatarLink,
    });
  };

  const logout = useCallback(() => {
    // Clear tokens from storage
    clearTokensFromStorage();

    // Clear keycloak instance
    keycloakUtils.dispose();

    // Check if we're in admin context and redirect to student home
    const currentWebClientId = localStorage.getItem(LOCALE_STORAGE_KEYS.WEB_CLIENT_ID);
    const isAdmin = currentWebClientId === WEB_CLIENT_ADMIN;

    // If logging out from admin, set web client to student
    if (isAdmin) {
      localStorage.setItem(LOCALE_STORAGE_KEYS.WEB_CLIENT_ID, WEB_CLIENT_STUDENT);
    }

    // Determine redirect URI - if admin, redirect to student home
    const redirectUri = isAdmin
      ? `${window.location.origin}${STUDENT_WEB_ROUTES.ROOT}`
      : window.location.origin;

    if (useDirectLogin && keycloak?.logout) {
      // For direct login, redirect to student home if admin, otherwise use default
      if (isAdmin) {
        window.location.href = STUDENT_WEB_ROUTES.ROOT;
      } else {
        keycloak.logout();
      }
    } else if (keycloak?.logout) {
      // For redirect login, use Keycloak's logout with redirect URI
      keycloak.logout({ redirectUri });
    } else {
      // Fallback: redirect directly
      window.location.href = isAdmin ? STUDENT_WEB_ROUTES.ROOT : '/';
    }
  }, [keycloak, useDirectLogin]);

  const changeWebClientId = useCallback((webClientId: string) => {
    localStorage.setItem(LOCALE_STORAGE_KEYS.WEB_CLIENT_ID, webClientId);
    if (webClientId === ADMIN_WEB_ROUTES.ROOT) {
      window.location.replace(ADMIN_WEB_ROUTES.ROOT);
    } else {
      window.location.replace(STUDENT_WEB_ROUTES.ROOT);
    }
  }, []);

  const value: AuthState = {
    isAuthenticated,
    userProfile,
    updateUserInfo,
    logout,
    changeWebClientId,
  };

  return (
    <AuthContext.Provider value={value}>
      {isAuthenticating && <KeycloakLoading />}
      {!isAuthenticating && children}
    </AuthContext.Provider>
  );
}
