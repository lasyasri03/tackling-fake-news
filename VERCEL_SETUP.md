# Vercel Git Scope / Root Directory Configuration

When Vercel asks for **"Git Scope"** or **"Root Directory"**, here's what to select:

## In Vercel Dashboard Setup

### Option 1: Select Root Directory (Recommended)
```
Root Directory: ./frontend
```

### Option 2: If asking for Git Scope
```
Git Scope: Full Repository
Root Directory: ./frontend
```

---

## Why?

This is a **monorepo** with two parts:
- **`/frontend`** → React app (deploy to Vercel) ← SELECT THIS
- **`/backend`** → Node.js API (deploy to Render separately)

Vercel needs to know to deploy ONLY the frontend from `./frontend` directory.

---

## Step-by-Step in Vercel Dashboard

1. **Import Repository** ✅
2. **Configure Project**
   - **Project Name**: `tackling-fake-news`
   - **Framework**: `Create React App` 
   - **Root Directory**: `./frontend` ← **THIS IS THE KEY**
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. **Environment Variables**
   - `REACT_APP_API_URL = https://your-render-backend.onrender.com`
4. **Click Deploy** ✅

---

## Common Issues

### ❌ "Can't find package.json"
**Solution**: Make sure **Root Directory** is set to `./frontend`

### ❌ "Build failed"
**Solution**: 
- Root Directory must be `./frontend`
- It will automatically use `frontend/package.json`

### ❌ "API not connecting"
**Solution**: 
- Add `REACT_APP_API_URL` environment variable
- Restart deployment (auto happens when env var changes)

---

## Auto-Config Files

The following files are already configured:
- ✅ `vercel.json` (root) - Tells Vercel to use ./frontend
- ✅ `frontend/vercel.json` - Frontend build settings
- ✅ `frontend/.env.example` - Environment template

You don't need to create anything - just select the **Root Directory** when prompted!

---

## Quick Reference

| Setting | Value |
|---------|-------|
| Root Directory | `./frontend` |
| Framework | Create React App |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Environment Variable | `REACT_APP_API_URL = [your-backend-url]` |

---

**That's it! Just set Root Directory to `./frontend` and click Deploy!** 🚀
