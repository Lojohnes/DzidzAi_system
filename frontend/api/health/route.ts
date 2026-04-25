import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    message: 'DzidzaAI Backend is running',
    timestamp: new Date().toISOString()
  });
}
