# 🚀 Quick Deployment Checklist

## Before You Start

- [ ] GitHub repository is up to date
- [ ] All code is committed and pushed
- [ ] `.env` file values are ready to copy
- [ ] Supabase database is accessible

---

## 1. Sign Up for Koyeb

**Go to:** https://koyeb.com/auth/signup

- [ ] Click "Continue with GitHub"
- [ ] Authorize Koyeb
- [ ] Complete registration

---

## 2. Deploy Backend

### On Koyeb Dashboard:

1. **Click "Create App"**

2. **Select Source:**
   - [ ] Choose "GitHub"
   - [ ] Select repository: `sap-business-management-system`
   - [ ] Branch: `main` or `saphaniox`

3. **Configure Service:**
   - [ ] Name: `sap-backend`
   - [ ] Region: Choose closest (Washington DC, Frankfurt, etc.)
   - [ ] Instance: `Free (Nano)`
   - [ ] **Builder:** Buildpack (auto-detect)
   - [ ] **Build command:** `npm install`
   - [ ] **Run command:** `npm start`
   - [ ] **Port:** `9000`
   - [ ] **Working Directory:** `server` ⚠️ CRITICAL!

4. **Add Environment Variables:**
   Click "Add Variable" for each:

   ```
   PORT=9000
   DATABASE_URL=postgresql://postgres.iwcjmjqrymomvbppumsm:Saphaniox80%40@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
   JWT_SECRET=7Qb5nX9wKm2pL8jR3vZ6cH4dF5gE8yT1uI9oP2sA6bD4kL7xM9nW3eC5jQ8zR2vY
   NODE_ENV=production
   EMAIL_USER=saptechnologies256@gmail.com
   EMAIL_PASSWORD=sevpccnlzykrkkvq
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

5. **Deploy:**
   - [ ] Review all settings
   - [ ] Click "Deploy"
   - [ ] Wait 3-5 minutes

6. **Copy Your Backend URL:**
   - [ ] Example: `https://sap-backend-yourname.koyeb.app`
   - [ ] Save this URL (you'll need it for frontend)

---

## 3. Test Backend

Open in browser or use curl:

```bash
# Test health endpoint
https://sap-backend-yourname.koyeb.app/api/health

# Should return: {"status":"ok","database":"connected",...}
```

- [ ] Health check returns 200 OK
- [ ] Database shows connected

---

## 4. Update Frontend

**Update API URL in frontend:**

Create/Update `client/.env.production`:
```env
VITE_API_URL=https://sap-backend-yourname.koyeb.app
```

**Or update in `client/src/services/api.js`:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://sap-backend-yourname.koyeb.app';
```

---

## 5. Update CORS (Backend)

Your backend already has ALLOWED_ORIGINS. Update it once you deploy frontend:

**After deploying frontend to Vercel, update Koyeb environment variable:**
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-domain.com
```

---

## 6. Monitor Deployment

**In Koyeb Dashboard:**
- [ ] Check "Logs" tab for any errors
- [ ] Verify "Status" shows "Healthy"
- [ ] Check "Metrics" for CPU/Memory usage

---

## ✅ Deployment Complete!

Your backend is now:
- ✅ Live 24/7 (never sleeps)
- ✅ Auto-deploys on GitHub push
- ✅ Fully managed and monitored
- ✅ Free forever (on free tier)

---

## 🔄 Future Updates

Just push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Koyeb automatically rebuilds and redeploys! 🚀

---

## 🐛 Troubleshooting

**Build fails?**
- Check logs in Koyeb Dashboard
- Verify working directory is set to `server`
- Ensure all dependencies are in package.json

**App crashes?**
- Check environment variables are correct
- Verify DATABASE_URL is accessible
- Check logs for error messages

**Connection issues?**
- Verify Supabase allows connections from Koyeb
- Check DATABASE_URL encoding (@ must be %40)
- Test connection from Koyeb logs

---

## 📞 Support

**Koyeb Docs:** https://koyeb.com/docs
**Koyeb Support:** https://koyeb.com/support
**Your Logs:** Koyeb Dashboard → App → Logs

---

**Ready? Go to https://koyeb.com and start deploying!** 🎯
