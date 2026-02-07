// OpenRouter API helper for Gemma 3 and other models

export type ChatSettings = {
  model?: string;
  sysTemInstructions?: string;
  temperature?: number;
};

export type ChatHistory = Array<{
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}>;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-3-4b-it:free';

export async function chatToGemini(
  userMessage: string,
  history: ChatHistory,
  settings: ChatSettings
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not found - Please set it in your .env file');
  }

  try {
    // System instruction to prepend to first message (Gemma 3 doesn't support system role)
    const systemInstruction = settings.sysTemInstructions || 
      'You are Tuto AI, a helpful assistant for students who do IGCSE and A-Levels Cambridge and Edexcel, to help them ace their exams. You are trained by Cambright. Your name is Tuto AI.';
    
    const messages: Array<{ role: string; content: string }> = [];

    // Convert history
    for (const msg of history) {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts.map(p => p.text).join('')
      });
    }

    // For the current message, prepend system instruction if this is the first message
    const isFirstMessage = history.length === 0;
    const currentMessage = isFirstMessage 
      ? `[INSTRUCTIONS: ${systemInstruction}]\n\nUser: ${userMessage}`
      : userMessage;

    // Add the current user message
    messages.push({
      role: 'user',
      content: currentMessage
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cambright.org',
        'X-Title': 'Cambright Tuto AI'
      },
      body: JSON.stringify({
        model: settings.model || DEFAULT_MODEL,
        messages: messages,
        temperature: settings.temperature || 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API Error:', response.status, errorData);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
}