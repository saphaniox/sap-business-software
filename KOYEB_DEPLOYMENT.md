# Koyeb Deployment Guide - Backend

## ✅ Your backend is ready for Koyeb deployment!

---

## 📋 Pre-Deployment Checklist

- [x] Package.json has `"start": "node src/index.js"`
- [x] Environment variables ready (.env)
- [x] Supabase database configured
- [x] All dependencies listed in package.json
- [x] Code pushed to GitHub

---

## 🚀 Step-by-Step Deployment

### **Step 1: Create Koyeb Account**

1. Go to **https://koyeb.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (easiest)
4. Authorize Koyeb to access your GitHub

---

### **Step 2: Create New Service**

1. Click **"Create App"** or **"Deploy"**
2. Choose **"GitHub"** as source
3. Select repository: **`sap-business-management-system`**
4. Click **"Configure"**

---

### **Step 3: Configure Build Settings**

**Basic Settings:**
- **Name:** `sap-backend` (or any name you prefer)
- **Region:** Choose closest to you (e.g., `Washington, D.C.` or `Frankfurt`)
- **Instance Type:** `Free` (Nano)

**Build Settings:**
- **Builder:** `Dockerfile` or `Buildpack`
- **Build Command:** `npm install` (auto-detected)
- **Run Command:** `npm start` (auto-detected)
- **Port:** `9000`

**Advanced Settings:**
- **Working Directory:** `server` ⚠️ IMPORTANT!
- **Branch:** `main` or `saphaniox`

---

### **Step 4: Add Environment Variables**

Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `PORT` | `9000` |
| `DATABASE_URL` | `postgresql://postgres.iwcjmjqrymomvbppumsm:Saphaniox80%40@aws-1-eu-north-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | `7Qb5nX9wKm2pL8jR3vZ6cH4dF5gE8yT1uI9oP2sA6bD4kL7xM9nW3eC5jQ8zR2vY` |
| `NODE_ENV` | `production` |
| `EMAIL_USER` | `saptechnologies256@gmail.com` |
| `EMAIL_PASSWORD` | `sevpccnlzykrkkvq` |
| `ALLOWED_ORIGINS` | `https://your-frontend-url.vercel.app` |

**⚠️ IMPORTANT:** Copy these from your `.env` file!

---

### **Step 5: Deploy!**

1. Review all settings
2. Click **"Deploy"**
3. Wait 3-5 minutes for build & deployment
4. You'll get a URL like: `https://sap-backend-yourname.koyeb.app`

---

### **Step 6: Verify Deployment**

Test your API:
```bash
# Check if server is running
curl https://sap-backend-yourname.koyeb.app/

# Check health endpoint (if you have one)
curl https://sap-backend-yourname.koyeb.app/api/health
```

---

## 🔄 Auto-Deploy Setup (Already Configured!)

Koyeb automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update backend"
git push origin main

# Koyeb automatically detects push and redeploys! 🚀
```

---

## ⚙️ Update Frontend API URL

After deployment, update your frontend to use the new backend URL:

**In `client/.env` or `client/.env.production`:**
```env
VITE_API_URL=https://sap-backend-yourname.koyeb.app
```

**In your React app (`client/src/services/api.js` or similar):**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
```

---

## 🛠️ Troubleshooting

### Build Fails?
**Check Logs:**
- Go to Koyeb Dashboard → Your App → Logs
- Look for error messages

**Common Issues:**
1. **Wrong working directory** → Set to `server`
2. **Missing dependencies** → Check `package.json`
3. **Port mismatch** → Use `9000` or `process.env.PORT`

### App Crashes After Deploy?
1. Check environment variables are set correctly
2. Verify DATABASE_URL is accessible from Koyeb
3. Check logs for database connection errors

### Database Connection Fails?
- Supabase connection pooler should work from anywhere
- Verify DATABASE_URL is correct (including password encoding `%40` for `@`)

---

## 📊 Monitor Your App

**Koyeb Dashboard shows:**
- Real-time logs
- CPU & Memory usage
- Request metrics
- Build history
- Deployment status

**Access logs:**
```
Dashboard → Your App → Logs → Real-time
```

---

## 💰 Koyeb Free Tier Limits

- ✅ **512 MB RAM** (enough for Node.js)
- ✅ **2 GB Storage**
- ✅ **100 GB Bandwidth/month**
- ✅ **Never sleeps** 🎉
- ✅ **1 free service**
- ✅ **Auto-deploy from GitHub**

---

## 🎯 Next Steps

1. **Deploy Backend to Koyeb** (follow steps above)
2. **Deploy Frontend to Vercel** (separate guide)
3. **Update CORS settings** in backend to allow frontend domain
4. **Test full application** end-to-end

---

## 📞 Need Help?

**Koyeb Docs:** https://koyeb.com/docs
**Support:** https://koyeb.com/support

---

## ✅ Deployment Complete!

Your backend will be live at: `https://sap-backend-yourname.koyeb.app`

**Benefits:**
- ✅ Never sleeps (unlike Render free tier)
- ✅ Auto-deploys on GitHub push
- ✅ Free SSL certificate
- ✅ Global edge network
- ✅ Zero cost!

🚀 **Ready to deploy? Go to https://koyeb.com and follow the steps above!**
