import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      throw new Error('Missing messages');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Format messages for Gemini API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedMessages.slice(0, -1), // All messages except the last one
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;
    const text = response.text();

    const formattedResponse = text
    .replace(/^"|"$/g, '') // Remove leading and trailing quotes
    .replace(/\\n/g, '\n')  // Convert \n into actual new lines
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert **bold** to <strong>
    .replace(/\*(.*?)\*/g, "<em>$1</em>"); // Convert *italic* to <em>

    return NextResponse.json({ response: formattedResponse });
  } catch (error: any) {
    console.error('Gemini API Error:', error.message || error);
    return NextResponse.json({ response: 'There was an error processing your request.' }, { status: 500 });
  }
}
