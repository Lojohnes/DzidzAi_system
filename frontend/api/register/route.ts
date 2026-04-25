import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user store
const users = new Map<string, any>();
let userIdCounter = 1;

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'student' } = await request.json();
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, password, and name are required' 
      }, { status: 400 });
    }
    
    // Check if user already exists
    for (const [id, user] of Array.from(users.entries())) {
      if (user.email === email) {
        return NextResponse.json({ 
          success: false, 
          error: 'User already exists' 
        }, { status: 409 });
      }
    }
    
    // Simple password hash (in production, use proper hashing)
    const hashedPassword = Buffer.from(password).toString('base64');
    
    // Create new user
    const userId = `user_${userIdCounter++}`;
    const newUser = {
      id: userId,
      email,
      name,
      role,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.set(userId, newUser);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        id: userId,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Registration failed' 
    }, { status: 500 });
  }
}
