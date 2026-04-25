# Vercel Serverless Deployment Guide

## Convert Backend to Serverless Functions

### Step 1: Move Backend to Frontend

1. **Create API folder in frontend:**
```bash
cd frontend
mkdir -p api/auth api/ai api/users api/content
```

2. **Move backend routes to API folder:**
```bash
# Copy these files:
backend/src/modules/auth/routes.js → frontend/api/auth/
backend/src/modules/ai/routes.js → frontend/api/ai/
backend/src/modules/users/routes.js → frontend/api/users/
backend/src/modules/content/routes.js → frontend/api/content/
```

### Step 2: Convert to Serverless Format

**Example: api/ai/generate.js**
```javascript
import { generateStructuredContent } from '../../backend/src/modules/ai/aiService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await generateStructuredContent(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Step 3: Update Frontend API Calls

**In frontend/lib/api.js:**
```javascript
export async function generateAI(payload) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}
```

### Step 4: Deploy

1. **Push to GitHub**
2. **Vercel will auto-deploy** with serverless functions
3. **No separate backend needed**

## Benefits
- ✅ Single deployment (frontend + backend)
- ✅ No server management
- ✅ Automatic scaling
- ✅ Free tier available

## Environment Variables
Add these in Vercel dashboard:
- `GROQ_API_KEY`
- `JWT_SECRET`
- `DATABASE_URL`
