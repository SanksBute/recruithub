# Render Quick Start Guide - Copy & Paste Values

## Backend Service Configuration

### Service Details
```
Name: recruithub-backend
Environment: Docker
Region: Oregon (US West) or closest to you
Branch: main
```

### Build Settings (Based on your screenshot)
```
Registry Credential: No credential

Dockerfile Path: ./Dockerfile

Docker Build Context Directory: .

Docker Command: (leave empty - uses Dockerfile CMD)

Pre-Deploy Command: (leave empty)

Auto-Deploy: Yes (On Commit)
```

### Environment Variables
Click "Add Environment Variable" and add each:

```
MONGO_URL = mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/

DB_NAME = recruitment_db

JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters-long

CORS_ORIGINS = *

PORT = 8001
```

---

## Frontend Service Configuration

### Service Details
```
Name: recruithub-frontend
Environment: Docker
Region: Oregon (US West) - SAME as backend
Branch: main
```

### Build Settings
```
Registry Credential: No credential

Dockerfile Path: ./Dockerfile

Docker Build Context Directory: .

Docker Command: (leave empty)

Pre-Deploy Command: (leave empty)

Auto-Deploy: Yes (On Commit)
```

### Environment Variables
```
REACT_APP_BACKEND_URL = https://YOUR-BACKEND-SERVICE.onrender.com
```

**IMPORTANT**: Replace `YOUR-BACKEND-SERVICE` with your actual backend service URL!

---

## Step-by-Step Deployment Process

### 1. Setup MongoDB Atlas (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free M0 cluster
4. Add database user (save username/password!)
5. Whitelist all IPs (0.0.0.0/0)
6. Get connection string
7. Replace `<password>` with your password

Example connection string:
```
mongodb+srv://admin:MyPassword123@cluster0.abc12.mongodb.net/
```

### 2. Deploy Backend (10 minutes)
1. Render Dashboard → New → Web Service
2. Connect GitHub repository
3. Configure as shown above
4. Set Root Directory: `backend`
5. Add all environment variables
6. Click "Create Web Service"
7. Wait for "Live" status
8. Copy your backend URL (e.g., `https://recruithub-backend.onrender.com`)

### 3. Deploy Frontend (10 minutes)
1. Render Dashboard → New → Web Service
2. Connect same GitHub repository
3. Configure as shown above
4. Set Root Directory: `frontend`
5. Add environment variable with YOUR backend URL
6. Click "Create Web Service"
7. Wait for "Live" status
8. Access your app!

### 4. Update Backend CORS (2 minutes)
1. Go to backend service
2. Environment tab
3. Update `CORS_ORIGINS` to your frontend URL:
```
CORS_ORIGINS = https://YOUR-FRONTEND-SERVICE.onrender.com
```
4. Save (auto redeploys)

---

## Critical Configuration Values

### For your screenshot form:

**Dockerfile Path**: `./Dockerfile` ← Use this exactly

**Docker Build Context Directory**: `.` ← Just a dot

**Docker Command**: Leave empty (blank)

---

## Common Mistakes to Avoid

❌ Wrong: `Dockerfile Path: Dockerfile` 
✅ Correct: `Dockerfile Path: ./Dockerfile`

❌ Wrong: `Docker Build Context Directory: /backend`
✅ Correct: `Docker Build Context Directory: .`

❌ Wrong: Forgetting to set Root Directory
✅ Correct: Set Root Directory to `backend` or `frontend`

❌ Wrong: Using localhost in REACT_APP_BACKEND_URL
✅ Correct: Use full Render URL `https://your-service.onrender.com`

---

## Testing Your Deployment

### Test Backend
```bash
# Should return API status
curl https://YOUR-BACKEND.onrender.com/api/

# View API docs
https://YOUR-BACKEND.onrender.com/docs
```

### Test Frontend
```
# Open in browser
https://YOUR-FRONTEND.onrender.com

# Login with:
Email: admin@recruitment.com
Password: Admin@123
```

---

## Need the MongoDB Connection String?

### Format:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/
```

### Example:
```
mongodb+srv://recruithub:MySecurePass123@cluster0.abc12.mongodb.net/
```

### Where to find parts:
- USERNAME: Your database user (you created this)
- PASSWORD: Your database user password
- CLUSTER: In Atlas dashboard, click "Connect" to see

---

## Free Tier Info

✓ Backend: Free
✓ Frontend: Free  
✓ MongoDB: Free (Atlas M0)
⚠️ Services sleep after 15 min inactivity
⚠️ Cold start: ~30 seconds on first request
⚠️ No persistent disk storage (files will be lost on restart)

**For production**: Upgrade to Starter plan ($7/month per service)

---

## Quick Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string copied
- [ ] Backend service created on Render
- [ ] Backend Root Directory: `backend`
- [ ] Backend Dockerfile Path: `./Dockerfile`
- [ ] Backend environment variables added
- [ ] Backend service is "Live"
- [ ] Backend URL copied
- [ ] Frontend service created on Render
- [ ] Frontend Root Directory: `frontend`
- [ ] Frontend Dockerfile Path: `./Dockerfile`
- [ ] Frontend REACT_APP_BACKEND_URL set to backend URL
- [ ] Frontend service is "Live"
- [ ] Backend CORS updated with frontend URL
- [ ] Tested login at frontend URL
- [ ] Changed default admin password

---

## Your Deployment URLs

Fill these in as you deploy:

```
MongoDB Connection: _________________________________

Backend Service: https://_________________________.onrender.com

Frontend Service: https://________________________.onrender.com

Admin Login: admin@recruitment.com / Admin@123
```

---

## Got Issues?

### Backend won't start?
1. Check logs in Render dashboard
2. Verify MongoDB connection string
3. Ensure all environment variables are set

### Frontend shows connection error?
1. Check REACT_APP_BACKEND_URL is correct
2. Verify backend service is running (green "Live")
3. Check backend CORS_ORIGINS includes frontend URL

### Can't login?
1. Check backend logs for errors
2. Verify MongoDB connection is working
3. Default admin should auto-create on first start

---

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- This repo's README.md for full documentation

Good luck! 🚀
