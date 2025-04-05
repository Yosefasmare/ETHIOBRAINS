import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, fileContent } = await req.json();

    if (!fileContent || !messages || messages.length === 0) {
      throw new Error('Missing file content or user messages');
    }

    const latestQuestion = messages[messages.length - 1].content;
    const prompt = `You are an intelligent assistant helping explain content. The user uploaded a document, and here is the full content: """${fileContent}""".\n\nBased on this content, answer the following question clearly and helpfully: "${latestQuestion}"`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Gemini API Error:', error.message || error);
    return NextResponse.json({ response: 'There was an error processing your request.' }, { status: 500 });
  }
}
