# Authentication Fix Validation Guide

## Summary of Changes

### 1. Fixed Infinite Refresh Token Loop
**File**: `services/api/axios.ts`

Added prevention check before attempting token refresh:
```typescript
if (originalRequest.url?.includes('/auth/refresh')) {
  return Promise.reject(error);
}
```

**Why this fixes it**: If the refresh request itself returns 401, it will no longer try to refresh again, preventing an infinite loop.

---

### 2. Fixed Cookie Configuration for Production (Vercel)
**File**: `backend/utils/token.ts`

Changed cookie settings for production HTTPS:
```typescript
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as const,
  path: '/',
};
```

**Why this fixes it**: 
- `sameSite: 'none'` + `secure: true` is required for HTTPS cookies to work on production
- Locally uses `sameSite: 'lax'` with `secure: false` for HTTP development

---

### 3. API Structure Consistency (Already Fixed)
- ✅ Axios baseURL: `/api`
- ✅ All API calls use relative paths: `/auth/me`, `/projects`, etc.
- ✅ No full domain URLs
- ✅ No `/api/api` duplication

---

## Local Testing (HTTP)

### Step 1: Verify Cookies Are Being Set
1. Open your browser DevTools (`F12`)
2. Go to **Application** tab → **Cookies**
3. Select `http://localhost:3000`
4. Login to your app
5. You should see two cookies:
   - `access_token` (httpOnly: ✓)
   - `refresh_token` (httpOnly: ✓)

### Step 2: Verify Cookie Configuration
For each cookie, check:
- **Domain**: `localhost`
- **Path**: `/`
- **Secure**: `false` (since it's HTTP locally)
- **HttpOnly**: `true` ✓
- **SameSite**: `Lax`

### Step 3: Test Token Refresh Flow
1. Open DevTools → **Network** tab
2. Login successfully
3. Wait for access token to expire OR manually trigger a request:
   - Click any button that calls an API
4. Watch the Network tab:
   - ❌ **BAD**: Multiple `/auth/refresh` calls (infinite loop)
   - ✅ **GOOD**: Single `/auth/refresh` call, then original request retries

### Step 4: Test Invalid Refresh Token
1. Open DevTools → **Application** → **Cookies**
2. Delete `refresh_token` cookie manually
3. Refresh the page
4. Try making an API call
5. Expected: Single 401 error, NO infinite requests

---

## Production Testing (Vercel HTTPS)

### Step 1: Verify Cookies on Production
1. Deploy to Vercel
2. Open your production URL in browser
3. Open DevTools → **Application** → **Cookies**
4. Select your Vercel domain (e.g., `your-app.vercel.app`)
5. Login
6. You should see:
   - `access_token`
   - `refresh_token`

### Step 2: Verify Production Cookie Configuration
For each cookie, check:
- **Domain**: Your Vercel domain
- **Path**: `/`
- **Secure**: `true` ✓ (HTTPS required)
- **HttpOnly**: `true` ✓
- **SameSite**: `None` ✓

### Step 3: Test API Calls
1. Open DevTools → **Network** tab
2. Perform various API actions (create project, update user, etc.)
3. Watch for `401` responses
4. Expected: 
   - **NOT** seeing `/auth/refresh` in normal operation
   - If token expires, exactly ONE `/auth/refresh` call
   - Then original request retries

### Step 4: Monitor for Infinite Loops
1. Open **Network** tab (filter by XHR)
2. Keep the page open for 30 seconds
3. **Expected**: No rapid repeated `/auth/refresh` calls
4. **If you see**: Repeating `/auth/refresh` calls = **PROBLEM** (infinite loop still exists)

---

## Debugging Checklist

### Issue: Cookies Not Being Set
- [ ] Check if login API returns `200`
- [ ] Verify `refresh_token` and `access_token` are in response (check Network → Response)
- [ ] Check backend `/api/auth/login` is calling `sendTokenCookies(user._id.toString())`
- [ ] Verify `withCredentials: true` in Axios config

### Issue: Cookies Not Being Sent
- [ ] Check Network tab: Cookies should be in **Request Headers** as `Cookie: access_token=...; refresh_token=...`
- [ ] If not present, verify Axios has `withCredentials: true`
- [ ] Check if CORS headers are allowing credentials

### Issue: Infinite Refresh Loop
- [ ] Open DevTools → **Network** tab
- [ ] Count how many `/auth/refresh` calls appear in succession
- [ ] If more than 1: The loop prevention isn't working
- [ ] Check: Is `originalRequest.url?.includes('/auth/refresh')` check present in axios.ts?

### Issue: 401 on Vercel but Works Locally
- [ ] Verify `sameSite: 'none'` is set for production
- [ ] Verify `secure: true` is set for production
- [ ] Check Vercel environment variables are correct (NODE_ENV, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET)
- [ ] Verify cookies can be sent across your domain (CORS issue?)

---

## Environment Variables Required

### Local `.env.local`
```
MONGODB_URI=mongodb://localhost:27017/ProjectHive
PORT=5000
CLIENT_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000  # Only for Express server, not used by Next.js API routes

ACCESS_TOKEN_SECRET=projecthive_secret_access_2026_!@#
REFRESH_TOKEN_SECRET=projecthive_secret_refresh_2026_$%^

# ... Firebase and other variables
```

### Vercel Environment Variables
```
MONGODB_URI=<production-db-url>
ACCESS_TOKEN_SECRET=projecthive_secret_access_2026_!@#
REFRESH_TOKEN_SECRET=projecthive_secret_refresh_2026_$%^
NODE_ENV=production

# ... Firebase and other variables
# DO NOT use BACKEND_URL (not needed)
# DO NOT use NEXT_PUBLIC_API_URL (not needed)
```

---

## Expected Behavior Timeline

### Scenario 1: Fresh Login
```
1. User logs in
2. POST /api/auth/login ✓ 200
3. Cookies set: access_token, refresh_token ✓
4. Frontend stores user data ✓
```

### Scenario 2: Normal API Call (within 15min)
```
1. GET /api/projects ✓ 200
2. No refresh needed ✓
3. Request succeeds immediately ✓
```

### Scenario 3: Access Token Expired
```
1. GET /api/projects ✗ 401
2. Interceptor catches error
3. Check: Is URL /auth/refresh? NO ✓
4. Set _retry = true ✓
5. POST /api/auth/refresh ✓ 200
6. Cookies updated with new tokens ✓
7. GET /api/projects (retry) ✓ 200
```

### Scenario 4: Refresh Token Invalid
```
1. GET /api/projects ✗ 401
2. Interceptor catches error
3. Check: Is URL /auth/refresh? NO ✓
4. Set _retry = true ✓
5. POST /api/auth/refresh ✗ 401
6. Check: Is URL /auth/refresh? YES ✓
7. Return error (NO RETRY) ✓
8. User is logged out ✓
```

---

## Quick Test Commands

### Test Refresh Endpoint Manually (Local)
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -b "access_token=<token>; refresh_token=<token>"
```

### Test with Invalid Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -b "refresh_token=invalid"
```

---

## Files Modified

1. ✅ `services/api/axios.ts` - Added infinite loop prevention
2. ✅ `backend/utils/token.ts` - Fixed cookie configuration for production

## Files Validated (No Changes Needed)

- ✅ `services/auth/auth.api.ts` - Correct API paths
- ✅ `services/projects.api.ts` - Correct API paths
- ✅ `services/cloudinary.service.ts` - Correct API paths
- ✅ `services/admin/admin.api.ts` - Correct API paths
- ✅ `app/api/auth/[action]/route.ts` - Correct routes
- ✅ `backend/controllers/auth.controller.ts` - Correct logic
- ✅ `backend/middlewares/auth.middleware.ts` - Correct middleware
- ✅ `.env.local` - NEXT_PUBLIC_API_URL removed (not needed)

---

## Success Indicators ✓

When everything is working:
- [ ] Login works (redirects to dashboard)
- [ ] Dashboard loads without 401 errors
- [ ] Creating/editing projects works
- [ ] 15min+ inactivity: Page auto-refreshes token, continues working
- [ ] Invalid refresh token: User logged out gracefully
- [ ] No infinite network requests in DevTools
- [ ] Works identically on Vercel and local
- [ ] Cookies persist across page refreshes
