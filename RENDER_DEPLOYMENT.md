# RecruitHub Deployment on Render

This guide will help you deploy the RecruitHub application on Render.com.

## Overview

You'll need to create 3 services on Render:
1. MongoDB Database (using MongoDB Atlas or Render's PostgreSQL alternative)
2. Backend Web Service (FastAPI)
3. Frontend Web Service (React)

---

## Prerequisites

1. **Render Account**: Sign up at https://render.com
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas Account**: Sign up at https://www.mongodb.com/cloud/atlas (Free tier available)

---

## Step 1: Set Up MongoDB (Using MongoDB Atlas)

### 1.1 Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a new FREE cluster (M0 Sandbox)
4. Choose a cloud provider and region (preferably same as Render)
5. Click "Create Cluster"

### 1.2 Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create username and password (save these!)
4. Set privileges to "Read and write to any database"

### 1.3 Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 1.4 Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

---

## Step 2: Deploy Backend on Render

### 2.1 Create New Web Service

1. Log in to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing RecruitHub

### 2.2 Configure Backend Service

**Basic Settings:**
```
Name: recruithub-backend
Region: Choose closest to your users
Branch: main (or your default branch)
Root Directory: backend
Runtime: Docker
```

**Docker Settings:**
```
Dockerfile Path: ./Dockerfile
Docker Build Context Directory: .
Docker Command: (leave empty - uses CMD from Dockerfile)
```

**Instance Type:**
```
Free (or choose paid plan for better performance)
```

### 2.3 Environment Variables

Click "Advanced" and add these environment variables:

```env
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
DB_NAME=recruitment_db
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this
CORS_ORIGINS=*
PORT=8001
```

**Important:** Replace the MongoDB URL with your actual Atlas connection string!

### 2.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://recruithub-backend.onrender.com`

---

## Step 3: Deploy Frontend on Render

### 3.1 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect same GitHub repository
3. Select the repository

### 3.2 Configure Frontend Service

**Basic Settings:**
```
Name: recruithub-frontend
Region: Same as backend
Branch: main
Root Directory: frontend
Runtime: Docker
```

**Docker Settings:**
```
Dockerfile Path: ./Dockerfile
Docker Build Context Directory: .
Docker Command: (leave empty)
```

**Instance Type:**
```
Free (or paid plan)
```

### 3.3 Environment Variables

```env
REACT_APP_BACKEND_URL=https://recruithub-backend.onrender.com
```

**Important:** Replace with your actual backend URL from Step 2.4!

### 3.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your app will be live at: `https://recruithub-frontend.onrender.com`

---

## Step 4: Update Backend CORS

### 4.1 Update Backend Environment Variables

1. Go to your backend service in Render
2. Click "Environment"
3. Update `CORS_ORIGINS` to your frontend URL:

```env
CORS_ORIGINS=https://recruithub-frontend.onrender.com
```

4. Save changes
5. Service will automatically redeploy

---

## Step 5: Test the Application

1. Open your frontend URL: `https://recruithub-frontend.onrender.com`
2. Login with default credentials:
   - Email: `admin@recruitment.com`
   - Password: `Admin@123`
3. Test main features:
   - Dashboard loads
   - Create a client
   - Create a position
   - Add a candidate
   - Try bulk resume upload

---

## Configuration Details for Render UI

Based on your screenshot, here are the exact values to enter:

### Backend Service Configuration

```yaml
Registry Credential: No credential
Dockerfile Path: ./Dockerfile
Docker Build Context Directory: .
Docker Command: (leave empty)
Pre-Deploy Command: (leave empty)
Auto-Deploy: On Commit
```

### Frontend Service Configuration

```yaml
Registry Credential: No credential
Dockerfile Path: ./Dockerfile
Docker Build Context Directory: .
Docker Command: (leave empty)
Pre-Deploy Command: (leave empty)
Auto-Deploy: On Commit
```

---

## Important Notes

### Free Tier Limitations

1. **Services spin down after 15 minutes of inactivity**
   - First request after inactivity takes 30-60 seconds (cold start)
   - Consider upgrading to paid plan for production

2. **Build time limits**
   - Free tier has build time limits
   - Frontend build might take 5-10 minutes

3. **Bandwidth limits**
   - 100GB/month on free tier

### Persistent Storage

⚠️ **IMPORTANT**: Render's free tier doesn't provide persistent disk storage. Uploaded files (resumes, JDs) will be lost when the service restarts.

**Solutions:**
1. **Use cloud storage** (AWS S3, Cloudinary, etc.) - Recommended
2. **Upgrade to paid Render plan** with persistent disks
3. **Use MongoDB GridFS** to store files in database

---

## Troubleshooting

### Backend Issues

**Problem**: Service fails to start
```bash
# Check logs in Render Dashboard → Logs
# Common issues:
# 1. Wrong MongoDB URL
# 2. Missing environment variables
# 3. Port already in use
```

**Solution**:
1. Verify MongoDB connection string
2. Check all environment variables are set
3. Ensure PORT is set to 8001

### Frontend Issues

**Problem**: Can't connect to backend
```bash
# Check:
# 1. REACT_APP_BACKEND_URL is correct
# 2. CORS is configured properly
# 3. Backend service is running
```

**Solution**:
1. Update `REACT_APP_BACKEND_URL` with correct backend URL
2. Update backend `CORS_ORIGINS` with frontend URL
3. Check backend service logs

### MongoDB Connection Issues

**Problem**: Can't connect to MongoDB
```bash
# Error: "MongoServerError: bad auth"
```

**Solution**:
1. Verify username and password in connection string
2. Ensure IP whitelist includes 0.0.0.0/0
3. Check database user has correct permissions

---

## Custom Domain Setup (Optional)

### 1. Add Custom Domain to Render

1. Go to service settings
2. Click "Custom Domain"
3. Add your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration instructions

### 2. Update Environment Variables

**Backend:**
```env
CORS_ORIGINS=https://app.yourdomain.com
```

**Frontend:**
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

---

## Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Update CORS to specific domain
- [ ] Set up MongoDB backups in Atlas
- [ ] Configure custom domain
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring alerts
- [ ] Implement file storage solution (S3/Cloudinary)
- [ ] Review and update security settings
- [ ] Set up environment-specific configs
- [ ] Enable HTTPS (automatic with Render)
- [ ] Set up database indexes for performance

---

## Monitoring and Maintenance

### View Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Use filters to search logs

### Service Metrics

1. Click "Metrics" tab
2. View CPU, Memory, and Network usage
3. Set up alerts for issues

### Manual Redeploy

1. Go to service page
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"

---

## Cost Optimization

### Free Tier Services

- Backend: Free ($0/month)
- Frontend: Free ($0/month)
- MongoDB: Free Atlas M0 ($0/month)
- **Total: $0/month**

### Recommended Paid Plan for Production

- Backend: Starter ($7/month)
- Frontend: Starter ($7/month)
- MongoDB: Atlas M10 ($9/month)
- **Total: ~$23/month**

---

## Upgrade Considerations

### When to Upgrade from Free Tier:

1. **Cold starts affecting user experience** (>100 users/day)
2. **Need persistent storage** for uploaded files
3. **Require custom domains**
4. **Need faster builds** and deployments
5. **Better performance** and reliability

---

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
- **RecruitHub Issues**: Check your repository issues
- **Render Community**: https://community.render.com/

---

## Quick Reference Commands

### View Service Status
```bash
curl https://recruithub-backend.onrender.com/api/
```

### Check API Documentation
```
https://recruithub-backend.onrender.com/docs
```

### Test Backend Health
```bash
curl https://recruithub-backend.onrender.com/api/
# Should return: {"message":"Recruitment Management API","status":"running"}
```

---

## Alternative: Deploy Both Services from Root

If you want to deploy from the repository root instead of subdirectories:

### Backend Service:
```yaml
Root Directory: (leave empty)
Dockerfile Path: backend/Dockerfile
Docker Build Context Directory: backend
```

### Frontend Service:
```yaml
Root Directory: (leave empty)
Dockerfile Path: frontend/Dockerfile
Docker Build Context Directory: frontend
```

---

## Success Metrics

After successful deployment, you should see:

✅ Backend service status: "Live"
✅ Frontend service status: "Live"
✅ Backend API responding at `/api/`
✅ Frontend loading at root URL
✅ Login page accessible
✅ Can login with default credentials
✅ Dashboard loads with data
✅ All navigation links work

---

## Need Help?

If you encounter issues:

1. Check service logs in Render dashboard
2. Verify all environment variables
3. Test MongoDB connection separately
4. Check CORS configuration
5. Review this guide step by step
6. Contact Render support for platform issues

Good luck with your deployment! 🚀