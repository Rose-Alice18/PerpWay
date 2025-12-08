# Vercel Environment Variable Setup

## Issue
Shopping requests and other API calls are failing in production because Vercel doesn't have the backend API URL configured.

## Solution
Add the following environment variable to your Vercel project:

### Steps:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`perpway` or `TheAshWay`)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add the following environment variable:

   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://perpway-backend.onrender.com`
   - **Environment**: Select all (Production, Preview, Development)

6. Click **Save**
7. Go to **Deployments** tab
8. Click the three dots menu on the latest deployment
9. Click **Redeploy**
10. Wait for the deployment to complete

## Verify
After redeployment, test the shopping request feature:
1. Go to https://perpway.app/shopping-request
2. Fill out the form and submit
3. It should work without errors

## Backend API
- **URL**: https://perpway-backend.onrender.com
- **Status**: ✅ Running on Render
- **Endpoints**: /api/auth, /api/delivery, /api/shopping, etc.

## Note
The `.env.production` file in the frontend folder contains this URL, but Vercel doesn't read `.env.production` files automatically. You must set environment variables in the Vercel dashboard.
