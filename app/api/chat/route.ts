import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, fileContent } = await req.json();

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

    // Only include file content in the last message if it's available
    const lastMessage = messages[messages.length - 1].content;
    const messageWithContext = fileContent 
      ? `Please answer this question based on the following document content:\n\n${fileContent}\n\nQuestion: ${lastMessage}`
      : lastMessage;

    try {
      const result = await chat.sendMessage(messageWithContext);
      const response = await result.response.text();

      const formattedResponse = response
      .replace(/^"|"$/g, '') // Remove leading and trailing quotes
      .replace(/\\n/g, '\n')  // Convert \n into actual new lines
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert **bold** to <strong>
      .replace(/\*(.*?)\*/g, "<em>$1</em>"); // Convert *italic* to <em>

      return NextResponse.json({ response: formattedResponse });
    } catch (error: any) {
      if (error.message?.includes('429')) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          details: 'The API is currently processing too many requests. Please try again in a few seconds.'
        }, { status: 429 });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error.message || error);
    return NextResponse.json({ 
      error: 'There was an error processing your request.',
      details: error.message 
    }, { status: 500 });
  }
}
