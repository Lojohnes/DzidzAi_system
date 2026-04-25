import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user store
const users = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Find user
    let userFound = null;
    for (const [id, user] of Array.from(users.entries())) {
      if (user.email === email) {
        userFound = user;
        break;
      }
    }
    
    if (!userFound) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    // Compare password (simple comparison for demo)
    const passwordMatch = userFound.password === Buffer.from(password).toString('base64');
    
    if (!passwordMatch) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    // Generate simple JWT token (in production, use proper JWT)
    const token = Buffer.from(`${userFound.id}:${Date.now()}`).toString('base64');
    
    return NextResponse.json({ 
      success: true, 
      data: {
        id: userFound.id,
        email: userFound.email,
        name: userFound.name,
        role: userFound.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    }, { status: 500 });
  }
}
