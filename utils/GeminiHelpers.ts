// Gemini Flash API helper for Tuto AI

export type ChatSettings = {
  model?: string;
  sysTemInstructions?: string;
  temperature?: number;
};

export type ChatHistory = Array<{
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}>;

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function chatToGemini(
  userMessage: string,
  history: ChatHistory,
  settings: ChatSettings
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found - Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env file');
  }

  const systemInstruction = settings.sysTemInstructions || 
    `You are Tuto AI, a helpful and knowledgeable assistant for students who do IGCSE and A-Levels Cambridge and Edexcel, to help them ace their exams. You are trained by Cambright. Your name is Tuto AI.

FORMATTING RULES (CRITICAL - ALWAYS FOLLOW):
- NEVER use hashtags (#, ##, ###) for headings
- Use **bold text** for important terms, concepts, and headings
- Use clear spacing between sections with blank lines
- Use colons (:) to introduce explanations and lists
- Structure your responses with clear sections separated by line breaks
- Use bullet points (•) or numbered lists for steps and multiple items
- Keep paragraphs short and well-spaced for readability
- Use underscores for emphasis on key points: _like this_
- Start responses with a brief, friendly acknowledgment when appropriate`;

  const contents = [
    ...history.map(msg => ({ role: msg.role, parts: msg.parts })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature: settings.temperature || 0.7,
        maxOutputTokens: 4096,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Invalid response from Gemini API');
  return text;
}
