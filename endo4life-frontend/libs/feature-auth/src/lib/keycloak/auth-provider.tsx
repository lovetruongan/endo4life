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
} from '@endo4life/feature-config';
import { stringUtils } from '@endo4life/util-common';

export type IUserProfile = KeycloakProfile;

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

export interface KeycloakUserProfile extends KeycloakProfile {
  [key: string]: unknown;
  username?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roles?: string[];
  userId?: string;
  name?: string;
}
export function AuthProvider({ children }: AuthProviderProps) {
  const [keycloak, setKeycloak] = useState<Keycloak>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userProfile, setUserProfile] = useState<KeycloakUserProfile>();
  const [useDirectLogin] = useState(true); // Set to true for direct login, false for redirect

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
      isActive:
        userInfo?.data?.status === UserInfoState.Inactive.toString()
          ? false
          : true,
    };
    setUserProfile(newUserProfile);
  };

  const handleDirectLogin = async (token: string, refreshToken: string) => {
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

      setIsAuthenticated(true);
      setKeycloak(keycloakInstance);
      keycloakUtils.setKeycloak(keycloakInstance);
      console.log('Authentication successful!');

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
        // For direct login, we just set authenticating to false and show login form
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

  const updateUserInfo = (profile: UserResponseDto) => {
    setUserProfile({
      ...userProfile,
      phoneNumber: profile.phoneNumber,
      state: profile.state,
      role: profile.role,
      lastName: profile.lastName,
      firstName: profile.firstName,
    });
  };

  const logout = useCallback(() => {
    keycloakUtils.dispose();
    if (useDirectLogin && keycloak?.logout) {
      // For direct login, use the simple logout function
      keycloak.logout();
    } else if (keycloak?.logout) {
      // For redirect login, use Keycloak's logout
      keycloak.logout({ redirectUri: window.location.origin });
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
      {!isAuthenticating && isAuthenticated && children}
      {!isAuthenticating && !isAuthenticated && useDirectLogin && (
        <LoginForm onLoginSuccess={handleDirectLogin} />
      )}
      {!isAuthenticating && !isAuthenticated && !useDirectLogin && (
        <LoginRequired />
      )}
    </AuthContext.Provider>
  );
}
