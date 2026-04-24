# Free Backend Deployment Options for DzidzaAI

Since Railway isn't working, here are the best free alternatives for your Node.js backend:

## Option 1: Render (Recommended)
**Free Tier:** 750 hours/month, automatic SSL, easy GitHub integration

### Steps:
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Set **Root Directory**: `backend`
6. **Runtime**: Node
7. **Build Command**: `npm run build`
8. **Start Command**: `npm start`
9. **Branch**: `main` (or your main branch)
10. Click "Create Web Service"

### Environment Variables (in Render Dashboard):
```
NODE_ENV=production
DATABASE_URL=your_postgresql_url
REDIS_URL=your_redis_url
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## Option 2: Heroku (Free Tier Available)
**Free Tier:** 550 dyno hours/month

### Steps:
1. Go to [heroku.com](https://heroku.com)
2. Sign up and create new app
3. Connect GitHub repository
4. Set **Buildpack**: Node.js
5. **Build Command**: `npm run build`
6. **Start Command**: `npm start`

### Environment Variables:
```
NODE_ENV=production
DATABASE_URL=your_postgresql_url
REDIS_URL=your_redis_url
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## Option 3: Vercel Serverless Functions
**Free Tier:** 100GB bandwidth/month, same platform as frontend

### Steps:
1. Create `api` folder in your frontend project
2. Move backend code to `api` folder
3. Convert Express routes to Vercel functions
4. Deploy together with frontend

### Example Structure:
```
frontend/
├── src/
├── api/
│   ├── auth/
│   ├── ai/
│   └── users/
└── package.json
```

---

---

## Using render.yaml Blueprint File

I've created a `render.yaml` blueprint file in your backend folder that Render will automatically detect. This file includes:

- Service configuration (Node.js runtime)
- Build and start commands
- Environment variables template
- Health check path
- Auto-deploy settings

**To use it:**
1. Push your code to GitHub (if not already done)
2. Go to render.com → New Web Service
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Update environment variables in Render dashboard with your actual values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `REDIS_URL`: Your Redis connection string  
   - `GROQ_API_KEY`: Your Groq API key
   - `JWT_SECRET`: Your JWT secret
   - `FRONTEND_URL`: Your Vercel app URL

This approach is more reliable than manual configuration!

---

## Option 4: Glitch
**Free Tier:** Always-on projects, sleep after 5 minutes inactivity

### Steps:
1. Go to [glitch.com](https://glitch.com)
2. Click "New Project" → "Import from GitHub"
3. Enter your repository URL
4. Set **Root Directory**: `backend`
5. Add environment variables in `.env` file
6. Click "Show" → "Live App"

---

## Option 5: Fly.io
**Free Tier:** 160 shared CPU hours/month

### Steps:
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. Create app: `fly launch`
4. Deploy: `fly deploy`

---

## Database Options (Free)

### PostgreSQL:
- **Supabase**: Free tier with 500MB database
- **Neon**: Free tier with 3GB database
- **PlanetScale**: Free tier with 5GB database

### Redis:
- **Upstash Redis**: Free tier with 10,000 requests/day
- **Redis Cloud**: Free tier with 30MB memory

---

## Quick Start with Render (Recommended)

1. **Prepare Repository:**
   - Push your code to GitHub
   - Ensure `backend/package.json` has correct scripts

2. **Deploy to Render:**
   - Go to render.com → New Web Service
   - Connect GitHub → Select repo
   - Root directory: `backend`
   - Build: `npm run build`
   - Start: `npm start`

3. **Setup Database:**
   - Create free PostgreSQL at [supabase.com](https://supabase.com)
   - Get connection string
   - Add to Render environment variables

4. **Update Frontend:**
   - Add `NEXT_PUBLIC_API_URL=https://your-app.onrender.com`
   - Redeploy Vercel frontend

---

## Troubleshooting Common Issues

### Build Fails:
- Check Node.js version (use 18.x)
- Verify `package.json` scripts
- Check for missing dependencies

### Database Connection:
- Ensure DATABASE_URL format is correct
- Check IP whitelist settings
- Verify database is running

### CORS Errors:
- Add FRONTEND_URL to backend CORS
- Check environment variable spelling

### API Not Working:
- Verify GROQ_API_KEY is valid
- Check logs in deployment dashboard
- Ensure all required env vars are set

---

## Recommended Setup: Render + Supabase

**Backend:** Render (Node.js)
**Database:** Supabase (PostgreSQL)
**Cache:** Upstash Redis (optional)
**Frontend:** Vercel (already deployed)

This gives you a completely free stack with:
- ✅ Automatic SSL
- ✅ GitHub integration
- ✅ Environment variables
- ✅ Logs and monitoring
- ✅ Easy scaling
