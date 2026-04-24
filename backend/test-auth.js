const { PrismaClient } = require('@prisma/client');
const { JWTService } = require('./src/utils/jwt');
require('dotenv').config();

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('=== Testing Authentication ===');
    
    // Get the user
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      }
    });
    
    if (!user) {
      console.log('No users found');
      return;
    }
    
    console.log('User found:', user);
    
    // Test JWT generation
    try {
      const accessToken = JWTService.generateAccessToken(user);
      console.log('Access token generated successfully');
      console.log('Token length:', accessToken.length);
      
      // Test JWT verification
      const payload = JWTService.verifyAccessToken(accessToken);
      console.log('Token verified successfully:', payload);
      
    } catch (jwtError) {
      console.error('JWT error:', jwtError.message);
      console.error('Full JWT error:', jwtError);
    }
    
  } catch (error) {
    console.error('Auth test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
