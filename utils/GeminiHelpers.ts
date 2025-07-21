import { GoogleGenerativeAI } from '@google/generative-ai';

export type ChatSettings = {
  model?: string;
  sysTemInstructions?: string;
  temperature?: number;
};

export type ChatHistory = Array<{
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}>;

// Check for API key
const apiKey = process.env.GOOGLE_GEMINI_API || process.env.GEMINI_API_KEY;

// Initialize genAI only if API key is available
let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function chatToGemini(
  userMessage: string,
  history: ChatHistory,
  settings: ChatSettings
): Promise<string> {
  try {
    if (!genAI) {
      throw new Error('API KEY NOT FOUND');
    }

    const model = genAI.getGenerativeModel({
      model: settings.model || 'gemini-2.0-flash',
      systemInstruction: settings.sysTemInstructions || 
        'you are a helpful assistant for students who do IGCSE and Alevels Cambridge and Edexcel, to help them ace their exams, you are trained by Cambright (NOT BY google) Your name is Tuto AI (NOT GEMINI)',
    });

    const chat = model.startChat({
      generationConfig: {
        temperature: settings.temperature || 1,
        topP: 0.9,
        responseMimeType: 'text/plain',
      },
      history: history,
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error(error);
    throw error;
  }
}