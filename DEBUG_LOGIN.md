# Debug Direct Login Issues

## Check Browser Console

1. Open Browser Developer Tools (F12)
2. Go to Console tab
3. Clear console and refresh page
4. Try to login again
5. Look for these messages:

Expected console logs:

```
Login response: {access_token: "...", refresh_token: "...", ...}
Calling onLoginSuccess with tokens...
Starting direct login with token...
Token payload: {...}
User info response: {...}
Authentication successful!
```

## Common Issues & Fixes

### 1. CORS Error on /info endpoint

If you see: `Access to XMLHttpRequest at 'http://localhost:8080/info' has been blocked by CORS`

**Solution**: Backend needs to allow CORS from localhost:3000

### 2. 404 on /info endpoint

The backend API endpoint might be `/api/v1/users/info` instead of just `/info`

**Fix**: Update `UserServiceUrl` in auth-provider.tsx:

```javascript
const userInfo = await axios.get(`${EnvConfig.UserServiceUrl}/api/v1/users/info`, {
```

### 3. Network tab shows no /info request

The code might be failing before making the request.

### 4. Authentication succeeds but UI doesn't update

React state might not be updating properly.

## Quick Test

1. After login, check these in console:

```javascript
// Check if tokens were received
localStorage.getItem('kc-token')
localStorage.getItem('kc-refresh-token')
```

2. Try manual API call:

```javascript
fetch('http://localhost:8080/api/v1/users/info', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
}).then(r => r.json()).then(console.log)
```

## Alternative Simple Fix

If user info endpoint is not critical, you can skip it temporarily:

In `auth-provider.tsx`, change line 159:

```javascript
// Even if user info fails, we're still authenticated
setIsAuthenticated(true);
setUserProfile({ username: 'anngu', email: 'user@example.com' } as any);
```

This will let you proceed past login while debugging the /info endpoint issue.
