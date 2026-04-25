# Heroku Deployment Guide for DzidzaAI

## Quick Steps

### 1. Install Heroku CLI
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
cd backend
heroku create dzidza-ai-backend
```

### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=25c6efa85817e9d5a3ccb0e444388a2008dc1b197365dd33b4eaabec886b2c98583a3472e546b454510be87eef027982bb350b709f3c05134a621e0cfd7b1f67
heroku config:set DATABASE_URL=your_postgresql_url
heroku config:set GROQ_API_KEY=your_groq_api_key
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 5. Deploy
```bash
git add .
git commit -m "Ready for Heroku deployment"
git push heroku main
```

### 6. Open App
```bash
heroku open
```

## Alternative: Heroku Dashboard

1. Go to [heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables in Settings → Config Vars

## Free Database Options

### PostgreSQL
- **Heroku Postgres**: Free tier available
- **Supabase**: Free PostgreSQL database
- **Neon**: Free PostgreSQL database

### Redis (Optional)
- **Redis Cloud**: Free tier available
- **Upstash**: Free Redis database

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version (should work with 18+)
2. **Database connection**: Verify DATABASE_URL format
3. **Port issues**: Use process.env.PORT (already configured)
4. **CORS errors**: Set FRONTEND_URL correctly

### Check Logs:
```bash
heroku logs --tail
```

## Success Indicators
- ✅ Build completes successfully
- ✅ App starts without errors
- ✅ Health endpoint works: `https://your-app.herokuapp.com/health`
- ✅ Frontend can connect to backend
