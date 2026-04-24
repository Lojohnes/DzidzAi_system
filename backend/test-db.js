const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Test if user table exists
    try {
      const userCount = await prisma.user.count();
      console.log(`Users table exists. Found ${userCount} users`);
    } catch (error) {
      console.error('Error accessing users table:', error.message);
    }
    
    // Test if child table exists
    try {
      const childCount = await prisma.child.count();
      console.log(`Children table exists. Found ${childCount} children`);
    } catch (error) {
      console.error('Error accessing children table:', error.message);
    }
    
    // List all tables
    try {
      const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      console.log('Available tables:', result.map(r => r.table_name));
    } catch (error) {
      console.error('Error listing tables:', error.message);
    }
    
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
