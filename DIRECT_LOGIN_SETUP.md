# Direct Login Setup

The application now supports two authentication modes:

## 1. Direct Login (Password Grant)

- Users enter username/password directly in the app
- No redirect to Keycloak login page
- Uses OAuth2 password grant type

## 2. Redirect Login (Authorization Code)

- Traditional Keycloak flow
- Redirects to Keycloak login page
- More secure for production

## Configuration

In `auth-provider.tsx`, change this line to switch modes:

```typescript
const [useDirectLogin] = useState(true);  // true = direct login, false = redirect
```

## Requirements for Direct Login

### Keycloak Client Settings

1. Go to Keycloak Admin Console
2. Navigate to your client `endo4life_app`
3. Enable **Direct Access Grants**:
   - Settings tab → Direct Access Grants Enabled: **ON**
4. Configure client authentication:
   - For confidential client: Use client secret
   - For public client: No secret needed

### Test Direct Login

```bash
# Test the password grant
./test-direct-login.sh

# Or manually:
curl --location 'https://keycloak.mydevopsproject2023.id.vn/realms/endo4life/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'client_id=endo4life_app' \
--data-urlencode 'client_secret=0LsxczPTGzHaGeZI8N9mIWn0XbtNfF4d' \
--data-urlencode 'username=anngu' \
--data-urlencode 'password=123456'
```

## Running the App

```bash
# Start backend
cd backend
./mvnw spring-boot:run

# Start frontend with direct login
./run-local.sh
```

## Login Form

When using direct login mode:

1. App shows a login form instead of redirecting
2. Enter your Keycloak username/password
3. Submit to authenticate
4. Tokens are obtained and stored
5. App proceeds normally

## Security Considerations

⚠️ Direct login (password grant) is less secure because:

- App handles user credentials directly
- Client secret may be exposed in frontend
- No SSO benefits

Recommended for:

- Development/testing
- Internal applications
- Mobile apps with secure storage

NOT recommended for:

- Public web applications
- Production environments
- Applications requiring SSO
