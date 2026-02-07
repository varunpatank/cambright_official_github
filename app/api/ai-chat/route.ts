import { NextResponse } from "next/server";
import { chatToGemini } from "@/utils/GeminiHelpers";
import { ChatHistory, ChatSettings } from "@/types";

export async function POST(req: Request) {
  try {
    const { userMessage, history, settings } = (await req.json()) as {
      userMessage: string;
      history: ChatHistory;
      settings: ChatSettings;
    };

    // Check if API key is available
    const apiKey = process.env.GOOGLE_GEMINI_API || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("No Gemini API key found in environment variables");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const aiResponse = await chatToGemini(userMessage, history, settings);

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("AI Chat Error:", error?.message || error);
    return NextResponse.json({ 
      error: error?.message || "ERROR w MODEL",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
