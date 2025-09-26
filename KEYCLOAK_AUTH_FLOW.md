# Keycloak Authentication Flow in Endo4Life

## Overview

The application uses Keycloak for authentication. Here's how the login flow works:

## Authentication Flow Steps

1. **App Initialization** (`app.tsx`)
   - The app wraps everything in `AuthProvider` component
   - Routes are determined based on web client (admin or student)

2. **Keycloak Initialization** (`auth-provider.tsx`)

   ```typescript
   const keycloakInstance = new Keycloak({
     url: EnvConfig.Endo4LifeUrl,      // https://keycloak.mydevopsproject2023.id.vn
     realm: EnvConfig.Endo4LifeRealm,   // endo4life
     clientId: EnvConfig.Endo4LifeClient // endo4life_app
   });
   ```

3. **Login Process**
   - Keycloak is initialized with `onLoad: 'login-required'`
   - This automatically redirects to Keycloak login page if user is not authenticated
   - User enters credentials on Keycloak login page
   - After successful login, user is redirected back to the app

4. **User Profile Loading**
   - After authentication, the app loads user profile from Keycloak
   - Then fetches additional user info from backend API: `GET /info`
   - Combines both to create complete user profile with roles, permissions, etc.

5. **Authentication States**
   - **Loading**: Shows `KeycloakLoading` component
   - **Not Authenticated**: Shows `LoginRequired` component (redirects to Keycloak)
   - **Authenticated**: Shows the actual app content

## Environment Variables Required

```bash
VITE_ENDO4LIFE_SERVICE_URL=http://localhost:8080          # Backend API URL
VITE_ENDO4LIFE_APP_URL=https://keycloak.mydevopsproject2023.id.vn  # Keycloak URL
VITE_ENDO4LIFE_ADMIN_WEB_URL=http://localhost:5173        # Admin web URL
VITE_ENDO4LIFE_USER_WEB_URL=http://localhost:5174         # Student web URL
VITE_ENDO4LIFE_APP_REALM=endo4life                        # Keycloak realm
VITE_ENDO4LIFE_APP_CLIENT=endo4life_app                   # Keycloak client ID
VITE_ENDO4LIFE_USER_SERVICE_URL=http://localhost:8080     # Backend API URL for user info
```

## Key Components

1. **AuthProvider**: Main authentication context provider
   - Manages Keycloak instance
   - Handles authentication state
   - Provides logout functionality
   - Stores user profile

2. **useAuthContext**: Hook to access authentication state
   - Access user profile
   - Check authentication status
   - Trigger logout

## Running Locally

1. Start the backend (must be running on localhost:8080)
2. Set environment variables (in terminal or .env file)
3. Run frontend: `npm run start:admin`
4. Browser will redirect to Keycloak login
5. Use Keycloak credentials to login
6. After login, redirected back to app

## Important Notes

- The app requires valid Keycloak configuration
- Backend must be running to fetch user info after Keycloak login
- Keycloak must have the `endo4life` realm and `endo4life_app` client configured
- The client must be configured for public access (no client secret in frontend)
