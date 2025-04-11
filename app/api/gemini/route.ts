import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    // Initialize Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Parse request body
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Missing text input" }, { status: 400 });
    }

    // Generate response from Gemini
    const response = await model.generateContent(text);
    const result = await  response.response.text();

    const formattedResponse = result
    .replace(/^"|"$/g, '') // Remove leading and trailing quotes
    .replace(/\\n/g, '\n')  // Convert \n into actual new lines
    .replace(/\*\*(.*?)\*\*/g, " ") // Convert **bold** to <strong>
    .replace(/\*(.*?)\*/g, " "); // Convert *italic* to <em>
  
  return NextResponse.json({ genRes: formattedResponse });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
