const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCORSAndDirect() {
  try {
    console.log('=== Testing Direct API Access ===');
    
    // Test 1: Simple health check
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await fetch('http://localhost:5000/health');
      const healthData = await healthResponse.json();
      console.log('Health check successful:', healthData);
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
    
    // Test 2: Test CORS preflight
    console.log('\n2. Testing CORS preflight...');
    try {
      const corsResponse = await fetch('http://localhost:5000/api/users/children', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      console.log('CORS preflight status:', corsResponse.status);
      console.log('CORS headers:', corsResponse.headers.raw());
    } catch (error) {
      console.error('CORS preflight failed:', error.message);
    }
    
    // Test 3: Direct POST without auth (should get 401)
    console.log('\n3. Testing direct POST without auth...');
    try {
      const postResponse = await fetch('http://localhost:5000/api/users/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          name: 'Test Child',
          gradeLevel: 1,
          preferredLanguage: 'SHONA'
        })
      });
      
      console.log('Direct POST status:', postResponse.status);
      const postData = await postResponse.text();
      console.log('Direct POST response:', postData);
    } catch (error) {
      console.error('Direct POST failed:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCORSAndDirect();
