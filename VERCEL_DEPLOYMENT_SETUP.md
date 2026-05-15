# Vercel Deployment Setup Guide

## Environment Variables for Vercel

Navigate to your Vercel project dashboard and add these environment variables in **Settings → Environment Variables**:

### Critical for Authentication
```
ACCESS_TOKEN_SECRET=projecthive_secret_access_2026_!@#
REFRESH_TOKEN_SECRET=projecthive_secret_refresh_2026_$%^
```

### Database
```
MONGODB_URI=<your-production-mongodb-connection-string>
```

### Firebase
```
FIREBASE_PROJECT_ID=projecthive-603f4
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@projecthive-603f4.iam.gserviceaccount.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAAVl7hIcs77cuPQrf-m8gUzZQRUmHavZI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projecthive-603f4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=projecthive-603f4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projecthive-603f4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=869851209122
NEXT_PUBLIC_FIREBASE_APP_ID=1:869851209122:web:0fd28f3fc7eb3163d726fb
```

### Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyidqgoje
CLOUDINARY_CLOUD_NAME=dyidqgoje
CLOUDINARY_API_KEY=494589911584325
CLOUDINARY_API_SECRET=caet2wu7mjw3Sj3QfawtJ6-T9ww
```

### Email (if used)
```
EMAIL_USER=testing1439790@gmail.com
EMAIL_PASS=utkbqcawkmefwyls
```

### ⚠️ DO NOT Add These (Not needed on Vercel)
- ❌ `NEXT_PUBLIC_API_URL` → Not needed, uses `/api` by default
- ❌ `BACKEND_URL` → Only for local Express server, not used on Vercel
- ❌ `PORT` → Vercel manages this automatically
- ❌ `CLIENT_URL` → Not needed for Next.js app
- ❌ `MONGODB_URI` → Only for MongoDB_locally_, use production value

---

## Environment Variable Groups (Recommended Setup)

### For Development
```
Development: All local values
```

### For Production (Vercel)
```
Production: All Vercel values
```

---

## How Cookie Authentication Works on Vercel

### 1. Domain Setup
- Your app: `your-app.vercel.app`
- Cookies are set for this domain
- `secure: true` (HTTPS only)
- `sameSite: 'none'` (allow cross-origin if needed)

### 2. Cookie Flow
```
Browser → https://your-app.vercel.app → Vercel Serverless Function
  ↓
  Next.js API Route (/api/auth/...)
  ↓
  Sets Cookies (sameSite: 'none', secure: true)
  ↓
  Browser receives and stores cookies
  ↓
  Future requests automatically include cookies
```

### 3. Verification
1. Login on production
2. Open DevTools → **Application** → **Cookies** → `your-app.vercel.app`
3. Check `access_token` and `refresh_token`:
   - ✅ Must show 🔒 (secure: true)
   - ✅ Must have `sameSite: None`
   - ✅ Must have `httpOnly: true`
   - ✅ Must have `path: /`
   - ✅ Domain: Your Vercel domain

---

## Deployment Steps

### 1. Prepare Code
```bash
# Make sure all fixes are applied
git status

# Should show modified:
#   - services/api/axios.ts
#   - backend/utils/token.ts
```

### 2. Commit and Push
```bash
git add .
git commit -m "fix: prevent infinite refresh loop and fix production cookies"
git push
```

### 3. Vercel Auto-Deploy
- Vercel will automatically detect changes
- Wait for build to complete
- Check build logs for errors

### 4. Monitor Deployment
```
Vercel Dashboard → Deployments → Latest
  ↓
  Build logs → Check for errors
  ↓
  Function logs → Check runtime errors
```

---

## Post-Deployment Verification

### Step 1: Test Login
```
1. Open your Vercel domain
2. Try to login
3. Expected: Redirect to dashboard without errors
4. Check DevTools → Console for errors
```

### Step 2: Check Cookies
```
1. DevTools → Application → Cookies
2. Verify access_token and refresh_token exist
3. Check sameSite is 'None' and secure is 🔒
```

### Step 3: Test API Calls
```
1. Open any page that makes API calls
2. DevTools → Network tab
3. Expected: API calls succeed (200, 201, etc.)
4. Not expected: 401 errors on first attempt
```

### Step 4: Test Token Refresh
```
1. Wait 15+ minutes (access token expires)
2. Make an API call
3. Expected: Single /auth/refresh call, then success
4. Not expected: Infinite /auth/refresh calls
```

### Step 5: Monitor Network for Loops
```
1. Keep page open for 5 minutes
2. DevTools → Network tab (XHR filter)
3. Expected: Normal API calls, no patterns
4. Not expected: Rapid repeated /auth/refresh calls
```

---

## Vercel Dashboard Checks

### Settings → Environment Variables
- [ ] All secrets are set (not showing in public view)
- [ ] Correct values for production
- [ ] No duplicate entries

### Deployments
- [ ] Latest deployment is successful (green checkmark)
- [ ] Build logs show no errors
- [ ] No warnings about dependencies

### Functions (Advanced)
- [ ] API routes are deployed as serverless functions
- [ ] Check cold start times
- [ ] Monitor for runtime errors

### Logs (Advanced)
- [ ] Check `/api/auth/login` calls succeed
- [ ] Check `/api/auth/refresh` calls are minimal
- [ ] Look for error patterns

---

## Common Vercel Issues & Fixes

### Issue: Cookies not set on Vercel
**Symptom**: Login works but cookies don't appear in DevTools

**Cause**: Missing secure/sameSite configuration

**Fix**: 
- Verify `sendTokenCookies` has production config
- Check: `isProduction = process.env.NODE_ENV === 'production'`
- Check: `sameSite: 'none'` when production is true

---

### Issue: 401 loops on Vercel only
**Symptom**: Works locally, infinite 401s on Vercel

**Cause**: Cookies not being sent/received

**Fix**:
1. Check Axios has `withCredentials: true`
2. Verify cookies can be read: Check DevTools → Application → Cookies
3. Check CORS headers allow credentials

---

### Issue: Database connection fails on Vercel
**Symptom**: 500 errors on API calls

**Cause**: `MONGODB_URI` not set or incorrect

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Verify `MONGODB_URI` is set to production DB
3. Test connection string locally first

---

### Issue: Firebase authentication fails on Vercel
**Symptom**: Login fails with Firebase error

**Cause**: Missing Firebase environment variables

**Fix**:
1. Verify all `FIREBASE_*` variables are set
2. Check `FIREBASE_PRIVATE_KEY` is properly formatted
3. Restart deployment after adding variables

---

## Rollback Plan

If issues occur on Vercel:

### Quick Rollback
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Rollback to this Deployment"
4. Confirm

### Or Revert Code
```bash
git revert HEAD
git push
```

---

## Performance Monitoring

### Check Vercel Metrics
```
Vercel Dashboard → Analytics
  ↓
  Response times for API routes
  ↓
  Look for spikes during /auth/refresh calls
```

### Optimize if Needed
```
If /auth/refresh is slow:
  ↓
  Check MongoDB query performance
  ↓
  Consider caching user lookups
```

---

## Troubleshooting Commands

### SSH into Vercel Logs
```bash
# View real-time logs
vercel logs

# View specific deployment logs
vercel logs --follow
```

### Check Environment
```bash
# Verify all environment variables are set
vercel env pull
cat .env.local
```

---

## Success Checklist ✓

After deployment to Vercel:
- [ ] Login works without errors
- [ ] Cookies appear in DevTools (secure, httpOnly, sameSite: None)
- [ ] API calls succeed (200, 201, etc.)
- [ ] No 401 errors on normal operation
- [ ] Token refresh happens once when needed, not infinitely
- [ ] Can edit projects, create items, etc.
- [ ] No JavaScript errors in console
- [ ] Works on different browsers (Chrome, Firefox, Safari)
- [ ] Works on mobile browsers
