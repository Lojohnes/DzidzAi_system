const axios = require('axios');

async function testChildEndpoint() {
  try {
    console.log('=== Testing Child Creation Endpoint ===');
    
    // First, let's try to login to get a token
    console.log('Testing login...');
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'lojohnes2012@gmail.com',
        password: 'Laugh@2012'
      });
      
      console.log('Login successful:', loginResponse.data);
      
      const token = loginResponse.data.data.accessToken;
      console.log('Got access token');
      
      // Now test child creation with the token
      console.log('\nTesting child creation...');
      
      const childData = {
        name: 'Test Child From API',
        gradeLevel: 1,
        preferredLanguage: 'SHONA'
      };
      
      const childResponse = await axios.post('http://localhost:5000/api/users/children', 
        childData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Child creation successful:', childResponse.data);
      
    } catch (loginError) {
      console.error('Login failed:', loginError.response?.data || loginError.message);
      
      if (loginError.response?.status === 500) {
        console.log('Login returned 500 - checking backend logs...');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testChildEndpoint();
