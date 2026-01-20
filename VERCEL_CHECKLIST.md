# ✅ Vercel Deployment Checklist

## 🎯 Quick Deploy (5 Minutes)

### **1. Sign Up**
- [ ] Go to https://vercel.com/signup
- [ ] Click "Continue with GitHub"
- [ ] Authorize Vercel

### **2. Import Project**
- [ ] Click "Add New..." → "Project"
- [ ] Select: `sap-business-management-system`
- [ ] Click "Import"

### **3. Configure**
- [ ] **Root Directory:** `client` ⚠️
- [ ] **Framework:** Vite (auto-detected)
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`

### **4. Environment Variables**
- [ ] Click "Environment Variables"
- [ ] Add: `VITE_API_URL` = `https://sap-business-management-software.koyeb.app`

### **5. Deploy**
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Copy your Vercel URL

### **6. Update CORS (Backend)**
- [ ] Go to Koyeb Dashboard
- [ ] Open service: `encouraging-brianne-sap-tech-0570304b`
- [ ] Settings → Environment Variables
- [ ] Update `ALLOWED_ORIGINS` to include your Vercel URL:
  ```
  ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
  ```
- [ ] Save and Redeploy

### **7. Test**
- [ ] Open your Vercel URL
- [ ] Try logging in
- [ ] Check API calls work
- [ ] No CORS errors

---

## ✅ You're Done!

```
Frontend:  https://your-app.vercel.app ✅
Backend:   https://sap-business-management-software.koyeb.app ✅
Database:  Supabase (8GB) ✅

TOTAL COST: $0/month 🎉
```

---

## 📝 Important Settings

**Root Directory:**
```
client  ← MUST BE SET!
```

**Environment Variable:**
```
Name:  VITE_API_URL
Value: https://sap-business-management-software.koyeb.app
```

**Backend CORS (After Deploy):**
```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

---

## 🚀 Future Deploys (Automatic)

Just push to GitHub:
```bash
git add .
git commit -m "Update"
git push origin main
# Vercel auto-deploys in 2-3 minutes! 🎉
```

---

**Ready? Go to https://vercel.com/signup and start!** 🚀
