# DzidzaAI Deployment Guide

## Overview
This guide will help you deploy the DzidzaAI educational platform with MSU branding to make it publicly accessible.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Database (PostgreSQL) access
- Redis server access
- Domain name and SSL certificate (optional but recommended)

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)
Best for Next.js applications with automatic deployments.

### Option 2: Railway/Render (Recommended for Backend)
Easy deployment for Node.js applications with database support.

### Option 3: Self-hosted VPS
Complete control over your deployment.

## Step-by-Step Deployment

### Phase 1: Build Frontend
```bash
cd frontend
npm run build
```

### Phase 2: Build Backend
```bash
cd backend
npm run build
```

### Phase 3: Configure Environment Variables
Backend environment variables needed:
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://host:port
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://yourdomain.com
```

Frontend environment variables needed:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Phase 4: Deploy Backend
Choose one of the following:

#### Railway Deployment:
1. Push code to GitHub
2. Connect Railway to GitHub
3. Select `backend` folder as root directory
4. Set environment variables
5. Deploy

#### Render Deployment:
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set build command: `npm run build`
5. Set start command: `npm run start`
6. Add environment variables
7. Deploy

### Phase 5: Deploy Frontend

#### Vercel Deployment:
1. Push code to GitHub
2. Connect Vercel to GitHub
3. Select `frontend` folder as root directory
4. Set build command: `npm run build`
5. Set output directory: `out`
6. Add environment variables
7. Deploy

### Phase 6: Configure Domain and SSL
1. Point your domain to the deployment URL
2. Configure SSL certificates (usually automatic with Vercel/Railway)
3. Update CORS settings in backend if needed

## Production Checklist
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] Frontend build successful
- [ ] Backend build successful
- [ ] SSL certificate active
- [ ] Domain pointing correctly
- [ ] API endpoints accessible
- [ ] Frontend loads without errors

## Monitoring
Once deployed, monitor:
- Application uptime
- Error logs
- Database performance
- API response times

## Troubleshooting
Common issues and solutions:
1. **CORS errors**: Update frontend URL in backend env
2. **Database connection**: Check DATABASE_URL format
3. **API not working**: Verify GROQ_API_KEY is valid
4. **Build failures**: Check Node.js version compatibility

## Security Considerations
- Use strong JWT secrets
- Enable rate limiting
- Configure database firewall
- Keep dependencies updated
- Use HTTPS in production
