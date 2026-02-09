# ⚡ DEPLOY NOW (3 Simple Steps)

## Step 1: Deploy Backend to Render (5 minutes)

```
1. Go to: https://render.com
2. Sign in with GitHub
3. Click: New + → Web Service
4. Select: tackling-fake-news repo
5. Settings:
   - Name: tackling-fake-news-backend
   - Start Command: node backend/server.js
   - Plan: Free
6. Add Environment Variables:
   PORT = 8000
   NODE_ENV = production
   FRONTEND_URL = https://[your-vercel-url].vercel.app
7. Click: Deploy
8. Wait 3-5 min for deploy... ✅
9. Copy your URL: https://[something].onrender.com
```

**Result**: Backend running at `https://[something].onrender.com`

---

## Step 2: Deploy Frontend to Vercel (3 minutes)

```
1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click: New Project
4. Select: tackling-fake-news repository
5. Settings:
   - Root Directory: ./frontend
   - Framework: Create React App
6. Environment Variable:
   REACT_APP_API_URL = https://[your-render-url].onrender.com
7. Click: Deploy
8. Wait 2-3 min... ✅
9. Result: https://[project-name].vercel.app
```

**Result**: Frontend running at `https://[project-name].vercel.app`

---

## Step 3: Test It Works (1 minute)

```
1. Visit: https://[project-name].vercel.app
2. Try: "The sun rises in the east"
3. Should see: REAL ✅
4. Done! 🎉
```

---

## ✅ Deployment Checklist

- [ ] Render account created (free)
- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Vercel account created (free)
- [ ] Frontend deployed to Vercel
- [ ] Environment variable set with backend URL
- [ ] Frontend redeployed
- [ ] Test claim works
- [ ] Share your URLs!

---

## URLs After Deploy

**Frontend**: https://[your-project].vercel.app
**Backend API**: https://[your-project]-backend.onrender.com

---

## Time Required: 10-15 minutes total
## Cost: $0 🎉
## No Credit Card: Required ✅

**Now go deploy! 🚀**
