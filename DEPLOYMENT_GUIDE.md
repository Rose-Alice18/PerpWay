# Perpway - DigitalOcean Deployment Guide

This guide walks you through deploying your Perpway application on DigitalOcean App Platform.

## ✅ Pre-Deployment Checklist

All items below are **READY** for deployment:

- ✅ MongoDB configured to use `MONGODB_URI` environment variable
- ✅ CORS configured for production with `FRONTEND_URL` environment variable
- ✅ PORT configured via environment variable
- ✅ Frontend API URL configured via `REACT_APP_API_URL`
- ✅ Build scripts in place
- ✅ Deprecated Mongoose options removed
- ✅ DigitalOcean App Platform spec file created

## Prerequisites

Before deploying, you need:

1. **GitHub Repository**
   - Push your code to GitHub (if not already done)
   - Make sure you're on the `main` branch

2. **MongoDB Database**
   - Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (FREE tier available)
   - Create a cluster and get your connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/perpway`

3. **Gmail App Password** (for email notifications)
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Generate a 16-character app password

4. **DigitalOcean Account**
   - Sign up at [DigitalOcean](https://www.digitalocean.com)

## Step-by-Step Deployment

### 1. Set Up MongoDB Atlas (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a **FREE M0 Cluster** (Shared, 512MB)
4. Click **"Connect"** → **"Connect your application"**
5. Copy your connection string:
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/perpway
   ```
6. **IMPORTANT**: Replace `<password>` with your actual database password
7. **Add IP Whitelist**: Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

### 2. Deploy on DigitalOcean App Platform (10 minutes)

#### Option A: Using the App Platform UI (Recommended)

1. **Create New App:**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click **"Create App"**
   - Choose **"GitHub"** as source
   - Authorize DigitalOcean to access your GitHub
   - Select your **TheAshWay** repository
   - Select branch: **main**

2. **Configure Backend Service:**
   - DigitalOcean will auto-detect your app
   - Edit the **Backend** component:
     - **Name**: `perpway-backend`
     - **Source Directory**: `/` (root)
     - **Build Command**: `npm install`
     - **Run Command**: `node backend/server.js`
     - **HTTP Port**: `5000`
     - **HTTP Routes**: `/api`
     - **Instance Size**: Basic ($5/month)

3. **Configure Frontend (Static Site):**
   - Edit the **Frontend** component:
     - **Name**: `perpway-frontend`
     - **Source Directory**: `/frontend`
     - **Build Command**: `npm install && npm run build`
     - **Output Directory**: `build`
     - **HTTP Routes**: `/` (root path)

4. **Add Environment Variables:**

   Click on the backend service → **Environment Variables** → Add these:

   | Key | Value | Type |
   |-----|-------|------|
   | `NODE_ENV` | `production` | Plain Text |
   | `PORT` | `5000` | Plain Text |
   | `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/perpway` | **Secret** |
   | `JWT_SECRET` | `your-super-secret-jwt-key-at-least-32-characters-long` | **Secret** |
   | `EMAIL_USER` | `your-gmail@gmail.com` | **Secret** |
   | `EMAIL_PASS` | `your-16-char-app-password` | **Secret** |
   | `ADMIN_EMAIL` | `roselinetsatsu@gmail.com` | Plain Text |
   | `FRONTEND_URL` | `${APP_URL}` | Plain Text |

   Click on the frontend static site → **Environment Variables** → Add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `${perpway-backend.PUBLIC_URL}` |

5. **Review and Deploy:**
   - Review your app configuration
   - Click **"Create Resources"**
   - Wait 5-10 minutes for deployment

#### Option B: Using the App Spec File

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Choose **"Import from Spec"**
4. Upload the `.do/app.yaml` file from your repository
5. Update the GitHub repo name in the spec
6. Add your secret environment variables in the UI
7. Click **"Create Resources"**

### 3. Post-Deployment Configuration

After deployment completes:

1. **Get Your URLs:**
   - Backend: `https://perpway-backend-xxxxx.ondigitalocean.app`
   - Frontend: `https://perpway-xxxxx.ondigitalocean.app`

2. **Update Frontend Environment Variable:**
   - Go to your frontend component settings
   - Verify `REACT_APP_API_URL` points to your backend URL
   - Trigger a redeployment if needed

3. **Test Your Application:**
   - Visit your frontend URL
   - Test user registration
   - Test delivery request creation
   - Check admin login
   - Verify email notifications work

### 4. Custom Domain (Optional)

To use your own domain (e.g., perpway.com):

1. Go to your app's **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain name
4. Update your domain's DNS settings:
   - Add CNAME record: `www` → `your-app.ondigitalocean.app`
   - Add A record for root domain (provided by DigitalOcean)
5. SSL certificate will be automatically provisioned

## Environment Variables Reference

### Backend Environment Variables

```bash
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/perpway

# Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Email Notifications
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
ADMIN_EMAIL=roselinetsatsu@gmail.com

# CORS
FRONTEND_URL=${APP_URL}  # Auto-populated by DigitalOcean
```

### Frontend Environment Variables

```bash
REACT_APP_API_URL=${perpway-backend.PUBLIC_URL}
```

## Cost Estimate

- **Backend (Basic)**: $5/month
- **Frontend (Static Site)**: $3/month
- **MongoDB Atlas (Free Tier)**: $0/month
- **SSL Certificate**: Free
- **Bandwidth**: 100GB included

**Total: ~$8/month**

## Troubleshooting

### MongoDB Connection Failed
- Check your MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify connection string has correct username/password
- Check MongoDB cluster is running

### CORS Errors
- Verify `FRONTEND_URL` environment variable is set correctly
- Check that frontend URL matches the deployed frontend domain

### Email Notifications Not Working
- Verify Gmail App Password (not regular password)
- Check `EMAIL_USER` and `EMAIL_PASS` are set correctly
- Test with a delivery request

### 502 Bad Gateway
- Check backend logs in DigitalOcean dashboard
- Verify `PORT=5000` environment variable is set
- Check MongoDB connection is successful

### Frontend API Calls Failing
- Verify `REACT_APP_API_URL` points to backend URL
- Rebuild frontend after changing environment variables

## Monitoring

DigitalOcean provides built-in monitoring:
- **Logs**: View real-time logs in the dashboard
- **Metrics**: CPU, Memory, Bandwidth usage
- **Alerts**: Set up email alerts for downtime

## Continuous Deployment

Your app is configured for **automatic deployment**:
- Any push to `main` branch triggers a new deployment
- Takes 5-10 minutes to build and deploy
- Zero downtime during deployments

## Database Backups

MongoDB Atlas automatically backs up your database:
- Daily backups (retained for 7 days on free tier)
- Point-in-time recovery available on paid tiers

## Scaling

To handle more traffic:
1. Go to your app settings
2. Change instance size (Basic → Professional)
3. Increase instance count (horizontal scaling)

## Support

- DigitalOcean Docs: https://docs.digitalocean.com/products/app-platform/
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- GitHub Issues: Create an issue in your repository

---

**Need Help?** Contact your development team or create an issue on GitHub.
