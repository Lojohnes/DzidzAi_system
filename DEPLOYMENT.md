# DzidzaAI Deployment Guide

## 🚀 Production Deployment

### **Backend Deployment (Render/Railway)**

#### **Environment Variables Required:**
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=dzidzai

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Authentication
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# AI Services
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key

# Redis
REDIS_URL=redis://your-redis-host:6379
```

#### **Deployment Steps:**
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy Backend on Render**
   - Connect GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add all environment variables
   - Deploy

3. **Database Setup**
   - Use PostgreSQL (Render Database or Neon)
   - Run migrations: `npm run migrate`

### **Frontend Deployment (Vercel)**

#### **Environment Variables Required:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

#### **Deployment Steps:**
1. **Push to GitHub** (if not already done)

2. **Deploy on Vercel**
   - Import project from GitHub
   - Framework preset: Next.js
   - Build command: `npm install && npm run build`
   - Output directory: `.next`
   - Add environment variable: `NEXT_PUBLIC_API_URL`
   - Deploy

## 🗄️ Database Migration

After deploying backend:
```bash
# Connect to your deployed backend
npm run migrate
```

## 🔧 Alternative Deployment Options

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up -d --build
```

### **Manual Server Deployment**
```bash
# Backend
cd backend
npm install --production
npm run build
npm start

# Frontend
cd frontend
npm install --production
npm run build
npm start
```

## 📋 Pre-Deployment Checklist

- [ ] All API keys configured (OpenAI, Groq)
- [ ] Database connection tested
- [ ] Redis connection tested
- [ ] JWT secret changed from default
- [ ] Frontend URL updated
- [ ] CORS settings configured
- [ ] HTTPS certificates installed
- [ ] Environment variables set in production
- [ ] Database migrations run

## 🌐 Live URLs After Deployment

- **Frontend**: `https://your-domain.com`
- **Backend API**: `https://your-api-domain.com`
- **API Documentation**: `https://your-api-domain.com/docs`

## 🔍 Testing Production

1. **Backend Health Check**
   ```bash
   curl https://your-api-domain.com/health
   ```

2. **Test AI Features**
   - Register/login
   - Generate AI content
   - Test offline functionality

3. **Test Multi-User Support**
   - Multiple user registration
   - Role-based access

## 🚨 Important Notes

- Change all default secrets before production
- Use HTTPS for all endpoints
- Monitor API usage for AI services
- Set up error monitoring (Sentry, etc.)
- Configure backup for database
- Set up logging and monitoring

## 📞 Support

For deployment issues:
1. Check environment variables
2. Verify database connection
3. Check API key configuration
4. Review deployment logs
