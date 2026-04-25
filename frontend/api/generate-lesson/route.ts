import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory user store (in production, use real database)
const users = new Map();
let userIdCounter = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate lesson using real Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an educational AI assistant for Zimbabwean students. Generate a comprehensive lesson about ${body.topic} for grade ${body.gradeLevel} level in ${body.language || 'English'}. Include:
1. Clear explanation
2. Practical examples
3. 3-5 practice questions with multiple choice answers
4. Make it culturally relevant to Zimbabwe context`
          },
          {
            role: 'user',
            content: `Generate a lesson about ${body.topic} for grade ${body.gradeLevel}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content;

    // Parse the response to extract structured data
    let lessonData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lessonData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback structure if JSON parsing fails
        lessonData = {
          explanation: aiResponse,
          example: `Example: ${body.topic} practice problem`,
          practice_questions: [
            {
              question: `What is ${body.topic}?`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correct_answer: "Option A"
            }
          ]
        };
      }
    } catch (error) {
      lessonData = {
        explanation: aiResponse,
        example: `Example: ${body.topic} practice problem`,
        practice_questions: [
          {
            question: `What is ${body.topic}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correct_answer: "Option A"
          }
        ]
      };
    }

    return NextResponse.json({ 
      success: true, 
      data: lessonData
    });
  } catch (error) {
    console.error('Error generating lesson:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate lesson' 
    }, { status: 500 });
  }
}
