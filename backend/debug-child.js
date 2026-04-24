const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function debugChildCreation() {
  try {
    console.log('=== Debugging Child Creation ===');
    
    // Get the first user (assuming there's at least one)
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      }
    });
    
    if (!user) {
      console.log('No users found in database');
      return;
    }
    
    console.log('Found user:', user);
    
    // Test creating a child with minimal data
    console.log('\nTesting child creation...');
    
    const childData = {
      name: 'Test Child',
      gradeLevel: 1,
      preferredLanguage: 'SHONA',
      parentId: user.id,
    };
    
    console.log('Child data:', childData);
    
    try {
      const child = await prisma.child.create({
        data: childData,
      });
      
      console.log('Child created successfully:', child);
      
      // Clean up - delete the test child
      await prisma.child.delete({
        where: { id: child.id }
      });
      console.log('Test child deleted');
      
    } catch (childError) {
      console.error('Child creation failed:', childError.message);
      console.error('Full error:', childError);
    }
    
  } catch (error) {
    console.error('Debug script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugChildCreation();
