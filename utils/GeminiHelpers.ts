import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatHistory, GenerationConfig, ChatSettings } from "@/types";

const apiKey = process.env.GOOGLE_GEMINI_API;

// Initialize GoogleGenerativeAI only if API key is available
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
export async function chatToGemini(
  userMessage: string,
  history: ChatHistory,
  settings: ChatSettings
): Promise<string> {
  if (!genAI) {
    throw new Error("Google Gemini API key is not configured. Please set GOOGLE_GEMINI_API environment variable.");
  }
  
  const model = genAI.getGenerativeModel({
    model: settings.model || "gemini-2.0-flash",
    systemInstruction:
      settings.sysTemInstructions ||
      "you are a helpful assistant for students who do IGCSE and Alevels Cambridge and Edexcel, to help them ace their exams, you are trained by Cambright (NOT BY google) Your name is Tuto AI (NOT GEMINI)",
  });
  const generationConfig: GenerationConfig = {
    temperature: settings.temperature || 1,
    topP: 0.9,
    responseMimeType: "text/plain",
  };
  const chatSession = model.startChat({
    generationConfig,
    history,
  });
  try {
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
