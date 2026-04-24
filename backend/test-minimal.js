const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.post('/api/users/children', (req, res) => {
  console.log('=== MINIMAL TEST: Request received ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  // Test basic response
  res.json({
    success: true,
    message: 'Minimal test working',
    received: {
      body: req.body,
      headers: req.headers
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Minimal server running' });
});

const PORT = 5001; // Different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`Minimal test server running on port ${PORT}`);
});
