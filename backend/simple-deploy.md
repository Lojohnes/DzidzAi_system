# Simple Render Deployment Guide

## Quick Fix for Render Issues

### 1. Clean Build
```bash
# In your local backend folder:
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

### 2. Update package.json
Change build command to simpler version:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

### 3. Environment Variables (Manual)
In Render dashboard → Settings → Environment Variables:
- NODE_ENV=production
- JWT_SECRET=25c6efa85817e9d5a3ccb0e444388a2008dc1b197365dd33b4eaabec886b2c98583a3472e546b454510be87eef027982bb350b709f3c05134a621e0cfd7b1f67
- GROQ_API_KEY=your_groq_api_key
- FRONTEND_URL=https://your-vercel-app.vercel.app

### 4. Health Check
Make sure /health endpoint works in your app.ts

### 5. Deploy
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select latest commit
4. Deploy

## Alternative: Use Railway
1. Go to railway.app
2. Connect GitHub
3. Set root directory: backend
4. Add environment variables
5. Deploy
