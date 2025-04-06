import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages, fileContent } = await req.json();

    if (!fileContent || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'Missing file content or user messages' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'API key not configured',
        details: 'GEMINI_API_KEY environment variable is not set'
      }, { status: 500 });
    }

    const latestQuestion = messages[messages.length - 1].content;
    
    // Enhanced prompt with system message and context
    const prompt = `You are an intelligent assistant helping explain content from uploaded documents. Your role is to:
1. Provide clear, accurate answers based on the document content
2. If the answer isn't in the document, say so clearly
3. Use markdown formatting for better readability
4. Be concise but thorough in your explanations

Document content: """${fileContent}"""

User question: "${latestQuestion}"

Please provide a helpful answer based on the document content.`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ response: text });
    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError);
      return NextResponse.json({ 
        error: 'Failed to get response from Gemini API',
        details: apiError.message || 'Unknown API error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
