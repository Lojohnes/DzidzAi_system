# Vercel Serverless Backend Guide

## Why Serverless is Perfect for You

✅ **100% Free** - No payment required
✅ **Same Platform** as your frontend
✅ **No Server Management** - Vercel handles everything
✅ **Automatic Scaling** - Works for any traffic level

## Quick Setup Steps

### 1. Create API Routes (Already Done)
I've created these files for you:
- `frontend/api/generate-lesson/route.ts` - AI lesson generation
- `frontend/api/health/route.ts` - Health check endpoint

### 2. Update Frontend API Calls

In your frontend, update API calls to use serverless routes:

```javascript
// Instead of calling your backend, use:
const response = await fetch('/api/generate-lesson', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

### 3. Deploy Everything Together

1. **Push to GitHub** (serverless routes are already there)
2. **Vercel auto-deploys** both frontend and backend
3. **Single URL** for everything

### 4. Environment Variables

Add these in Vercel dashboard:
- `GROQ_API_KEY` - Your Groq API key
- `JWT_SECRET` - Same as before

### Benefits

🎯 **Single Deployment** - Frontend + Backend together
🎯 **No Backend Costs** - Everything on Vercel free tier
🎯 **Easy Management** - One dashboard for everything
🎯 **MSU Branding** - Works perfectly

### Next Steps

1. Test the serverless routes
2. Add more API endpoints as needed
3. Your DzidzaAI is fully deployed and free!

This is the **best solution** for your situation - completely free and easy to manage!
