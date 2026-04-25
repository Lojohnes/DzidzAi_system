import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock AI generation for now
    const mockResponse = {
      explanation: "This is a lesson about " + body.topic + " for grade " + body.gradeLevel,
      example: "Example: " + body.topic + " practice problem",
      practice_questions: [
        {
          question: "What is " + body.topic + "?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct_answer: "Option A"
        }
      ]
    };

    return NextResponse.json({ 
      success: true, 
      data: mockResponse 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate lesson' 
    }, { status: 500 });
  }
}
