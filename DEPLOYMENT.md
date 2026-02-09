# Deployment Guide - Tackling Fake News (100% FREE)

## Free Deployment (No Credit Card Required!)

This project is deployed using completely free services:
- **Frontend**: Vercel (unlimited free tier)
- **Backend**: Render (free tier)
- **Database**: JSON files (no setup needed)

**Costs: $0/month** ✅

---

## Step 1: Deploy Frontend to Vercel (FREE)

### 1.1 Sign up on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign in with GitHub (create free account if needed)

### 1.2 Import Your GitHub Repository
1. Click "New Project"
2. Select "Import Git Repository"
3. Enter: `https://github.com/lasyasri03/tackling-fake-news`
4. Click "Import"

### 1.3 Configure Build Settings
1. **Project Name**: `tackling-fake-news`
2. **Framework**: `Create React App`
3. **Root Directory**: `./frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `build`

### 1.4 Environment Variables (After Backend is Deployed)
Add this environment variable:
```
REACT_APP_API_URL = https://your-backend-url.onrender.com
```
(Get actual URL after deploying backend in Step 2)

### 1.5 Deploy!
Click "Deploy" - Vercel will build and deploy automatically

**Result**: Frontend live at `https://tackling-fake-news.vercel.app` (or auto-generated name)

---

## Step 2: Deploy Backend to Render (FREE)

### 2.1 Sign up on Render
1. Go to [render.com](https://render.com)
2. Click "Get Started"
3. Sign in/Sign up with GitHub

### 2.2 Create New Web Service
1. Click "New +"
2. Select "Web Service"
3. Select your `tackling-fake-news` GitHub repository
4. Click "Connect"

### 2.3 Configure Settings
- **Name**: `tackling-fake-news-backend`
- **Environment**: `Node`
- **Build Command**: `npm install` (if needed)
- **Start Command**: `node backend/server.js`
- **Plan**: Select "Free" (NOT Pro)

### 2.4 Add Environment Variables
Go to "Environment" section and add:
```
PORT = 8000
NODE_ENV = production
FRONTEND_URL = https://tackling-fake-news.vercel.app
```

Update the FRONTEND_URL with your actual Vercel URL from Step 1.

### 2.5 Deploy!
Click "Create Web Service" - Render will build and deploy

**Result**: Backend live at `https://tackling-fake-news-backend.onrender.com` (auto-generated)

**⚠️ Render Free Tier Note**: Service spins down after 15 minutes of inactivity. First request after sleep takes 30-60 seconds. Totally free though!

---

## Step 3: Update Frontend with Backend URL

1. Go back to Vercel Dashboard
2. Select your project → Settings → Environment Variables
3. Update `REACT_APP_API_URL` with your Render backend URL:
   ```
   REACT_APP_API_URL = https://tackling-fake-news-backend.onrender.com
   ```
4. Click "Save"
5. Vercel will automatically redeploy

---

## Step 4: Test Your Deployment

### Test Frontend
1. Visit: `https://tackling-fake-news.vercel.app`
2. Try: "The sun rises in the east"
3. Should return: ✅ **REAL** verdict

### Test Backend API
```bash
curl -X POST "https://tackling-fake-news-backend.onrender.com/analyze" \
  -H "Content-Type: application/json" \
  -d '{"claim":"The sun rises in the east"}'
```

Should return:
```json
{
  "verdict": "REAL",
  "confidence": 0.99,
  "reason": "Scientifically verified: The sun rises in the east...",
  "tags": ["astronomy", "science", "verified"]
}
```

---

## Free Tier Limitations & Solutions

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100GB bandwidth per month
- ✅ Superior performance
- ✅ Auto-scaling
- **No limitations for this project**

### Render Free Tier
- ✅ 1 free web service
- ✅ Auto-deploy from GitHub
- ⚠️ Spins down after 15 min inactivity (first request is slow)
- ⚠️ 750 hours/month limit (still covers 24/7)
- ✅ SSL certificate included

**Solution for sleep issue**: Visit your app once daily to keep it "warm" or upgrade to paid tier later if needed.

---

## Troubleshooting

### Render Service Won't Start
- Check logs: Render Dashboard → Your Service → Logs
- Ensure `backend/server.js` exists
- Verify `Start Command` is: `node backend/server.js`

### CORS Errors
1. Check `FRONTEND_URL` is set in Render
2. Verify it matches your Vercel domain exactly
3. Backend will automatically add it to whitelist

### Socket.IO Connection Issues
- Backend URL must be set in Vercel as `REACT_APP_API_URL`
- WebSocket connections work on Render free tier
- First connection after sleep will take 30-60 seconds

### Slow First Request
This is normal on Render free tier (service spin-up). Keep visiting to stay "warm" or upgrade later.

---

## Auto-Deploy on GitHub Push

Both services are already configured for auto-deployment:
1. Push code to GitHub
2. Vercel automatically rebuilds frontend
3. Render automatically rebuilds backend
4. Tests run on deployment

---

## Free Forever vs Paid Upgrade Path

### Stay Free Forever
- Use Vercel + Render free tiers indefinitely
- Accept Render's 15-min sleep (no cost)
- Totally functional for personal/educational use

### Upgrade Path (When Needed)
- **Vercel Pro**: $15-25/month (adds team features)
- **Render Paid**: $12-25/month (removes sleep, auto-scaling)
- **Total Rough Cost**: $0-50/month

But for now, **$0 cost** ✅

---

## Step-by-Step Checklist

- [ ] Create Vercel account (free)
- [ ] Deploy frontend from GitHub
- [ ] Get Vercel frontend URL
- [ ] Create Render account (free)
- [ ] Deploy backend from GitHub
- [ ] Get Render backend URL
- [ ] Update Vercel environment variables with backend URL
- [ ] Test frontend at Vercel URL
- [ ] Test API at Render URL
- [ ] Share links with friends!

---

## Quick Links

- **Frontend Dashboard**: https://vercel.com/dashboard
- **Backend Dashboard**: https://dashboard.render.com
- **Your Frontend**: https://tackling-fake-news.vercel.app (after deploy)
- **Your Backend**: https://tackling-fake-news-backend.onrender.com (after deploy)
- **GitHub Repo**: https://github.com/lasyasri03/tackling-fake-news

---

## Keep Your Deployment "Warm" (Optional)

To prevent Render sleep, add a simple bot to ping every 14 minutes:

```javascript
// Add to backend/server.js
setInterval(() => {
  fetch(process.env.FRONTEND_URL || 'http://localhost:3000')
    .catch(() => {});
}, 14 * 60 * 1000); // Every 14 minutes
```

Or use free services like:
- [UpTimeRobot.com](https://uptimerobot.com) (free tier)
- [Kping.io](https://kping.io) (free pinging)

---

## Support

- **Vercel**: https://vercel.com/support
- **Render**: https://render.com/docs
- **Project**: https://github.com/lasyasri03/tackling-fake-news

---

**Cost**: 🎉 **$0/month**
**Deployment**: ✅ **Live & Free**
**Created**: February 2026
