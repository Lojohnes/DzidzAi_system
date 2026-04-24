require('dotenv').config();
const { AIService } = require('./dist/modules/ai/aiService');

async function testAIParsing() {
  console.log('Testing AI response parsing...');
  console.log('Mock mode:', process.env.AI_USE_MOCK);
  
  try {
    // Test with mock data
    const testRequest = {
      subject: 'Math',
      topic: 'Addition',
      gradeLevel: 'Grade 2',
      language: 'Shona',
      mode: 'online',
      userId: 'test-user'
    };
    
    console.log('Sending test request:', testRequest);
    const response = await AIService.generateStructuredContent(testRequest);
    
    console.log('AI Response:', response);
    console.log('Has explanation:', !!response.explanation);
    console.log('Has example:', !!response.example);
    console.log('Has practice questions:', !!response.practice_questions);
    console.log('Practice questions count:', response.practice_questions?.length || 0);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAIParsing();
