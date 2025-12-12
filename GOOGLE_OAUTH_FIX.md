# Fix Google OAuth "redirect_uri_mismatch" Error

## Problem
Getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google.

## Root Cause
The Google OAuth callback URL in your Google Cloud Console doesn't match what your app is sending.

## Solution

### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Sign in with the account that created the OAuth client
3. Find your OAuth 2.0 Client ID: `763799291935-e4sgapfb4v2a2pbnolt3vsujohiim404.apps.googleusercontent.com`
4. Click on it to edit
5. Under **Authorized redirect URIs**, add these URLs:
   ```
   http://localhost:5000/api/auth/google/callback
   https://perpway-backend.onrender.com/api/auth/google/callback
   ```
6. Click **Save**

### Step 2: Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (`perpway-backend`)
3. Click on **Environment** tab
4. Update the `GOOGLE_CALLBACK_URL` environment variable:
   - **Key**: `GOOGLE_CALLBACK_URL`
   - **Value**: `https://perpway-backend.onrender.com/api/auth/google/callback`

   (Change it from the relative path `/api/auth/google/callback` to the full URL)

5. Also add `FRONTEND_URL` if not already set:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://perpway.app`

6. Click **Save Changes**
7. Your backend will automatically redeploy

### Step 3: Verify

After the backend redeploys:
1. Go to https://perpway.app/signin
2. Click "Sign in with Google"
3. It should now work without the redirect_uri_mismatch error

## Technical Details

The error occurs because:
- Google requires the **exact** redirect URI to be pre-registered in Google Cloud Console
- Your app is currently sending `https://perpway-backend.onrender.com/api/auth/google/callback`
- But Google Cloud Console doesn't have this URI registered yet

## Alternative: Fix in Code (Optional)

If you want to make the code more robust, you can update the passport configuration:

**File**: `backend/config/passport.js` (line 23)

Change from:
```javascript
callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
```

To:
```javascript
callbackURL: process.env.GOOGLE_CALLBACK_URL,
```

And always ensure `GOOGLE_CALLBACK_URL` is set as a full URL in both development and production environments.

## Environment Variables Summary

**Local Development** (`.env`):
```env
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:2000
```

**Production** (Render):
```env
GOOGLE_CALLBACK_URL=https://perpway-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://perpway.app
```
