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

    const aiResponse = await chatToGemini(userMessage, history, settings);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ERROR w MODEL" }, { status: 500 });
  }
}
