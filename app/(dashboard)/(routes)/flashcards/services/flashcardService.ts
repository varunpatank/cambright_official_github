// OpenRouter API for AI flashcard generation

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-3-4b-it:free';

export interface GeneratedFlashcard {
  id: number;
  question: string;
  answer: string;
  topic: string;
}

export interface GenerationProgress {
  currentStep: number;
  totalSteps: number;
  status: string;
  percentage: number;
}

// Helper function to call OpenRouter API
async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const systemContext = '[INSTRUCTIONS: You are an expert IGCSE and A-Level flashcard generator. Generate high-quality flashcards with concise questions and answers. Always respond with valid JSON only. Do not include any text before or after the JSON array.]\n\n';

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cambright.org',
      'X-Title': 'Cambright Flashcard Generator'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'user',
          content: systemContext + prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Parse JSON from AI response
function parseFlashcardsFromResponse(response: string): GeneratedFlashcard[] {
  try {
    // Try to find JSON array in the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    
    return parsed.map((card: any, index: number) => ({
      id: index + 1,
      question: card.question || card.q || '',
      answer: card.answer || card.a || '',
      topic: card.topic || ''
    })).filter((card: GeneratedFlashcard) => card.question && card.answer);
  } catch (error) {
    console.error('Failed to parse flashcards:', error);
    return [];
  }
}

// Generate flashcards for a topic
export async function generateFlashcards(
  subject: string,
  topics: string[],
  numCards: number,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedFlashcard[]> {
  const allFlashcards: GeneratedFlashcard[] = [];
  const cardsPerTopic = Math.ceil(numCards / (topics.length || 1));
  
  // Update progress
  const updateProgress = (step: number, status: string) => {
    if (onProgress) {
      onProgress({
        currentStep: step,
        totalSteps: topics.length || 1,
        status,
        percentage: Math.round((step / (topics.length || 1)) * 100)
      });
    }
  };

  if (topics.length === 0) {
    // Generate for the whole subject
    updateProgress(0, `Generating flashcards for ${subject}...`);
    
    const prompt = `Generate exactly ${numCards} flashcards for ${subject}.
Each flashcard should have a clear, concise question and a brief answer.
Focus on key concepts, definitions, and important facts.

Return ONLY a JSON array with this exact format:
[
  {"question": "What is X?", "answer": "X is...", "topic": "${subject}"},
  ...
]

Generate exactly ${numCards} flashcards. No explanation, just the JSON array.`;

    try {
      const response = await callOpenRouter(prompt);
      const flashcards = parseFlashcardsFromResponse(response);
      allFlashcards.push(...flashcards.slice(0, numCards));
      updateProgress(1, 'Complete!');
    } catch (error) {
      console.error('Generation error:', error);
      updateProgress(1, 'Error generating flashcards');
    }
  } else {
    // Generate for each topic
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      updateProgress(i, `Generating flashcards for ${topic}...`);
      
      const remainingCards = numCards - allFlashcards.length;
      const cardsToGenerate = Math.min(cardsPerTopic, remainingCards);
      
      if (cardsToGenerate <= 0) break;
      
      const prompt = `Generate exactly ${cardsToGenerate} flashcards for the topic "${topic}" in ${subject}.
Each flashcard should have a clear, concise question and a brief answer.
Focus on key concepts, definitions, formulas, and important facts for this specific topic.

Return ONLY a JSON array with this exact format:
[
  {"question": "What is X?", "answer": "X is...", "topic": "${topic}"},
  ...
]

Generate exactly ${cardsToGenerate} flashcards. No explanation, just the JSON array.`;

      try {
        const response = await callOpenRouter(prompt);
        const flashcards = parseFlashcardsFromResponse(response);
        
        // Add topic to flashcards
        const topicFlashcards = flashcards.slice(0, cardsToGenerate).map((card, idx) => ({
          ...card,
          id: allFlashcards.length + idx + 1,
          topic: topic
        }));
        
        allFlashcards.push(...topicFlashcards);
      } catch (error) {
        console.error(`Error generating flashcards for ${topic}:`, error);
      }
    }
    
    updateProgress(topics.length, 'Complete!');
  }

  return allFlashcards.slice(0, numCards);
}

// Subject and topic data for the dropdown
export const FLASHCARD_SUBJECTS = {
  'IGCSE Biology': [
    'Cell structure and organization',
    'Movement in and out of cells',
    'Biological molecules',
    'Enzymes',
    'Plant nutrition (photosynthesis)',
    'Human nutrition',
    'Transport in plants',
    'Transport in humans',
    'Diseases and immunity',
    'Gas exchange',
    'Respiration',
    'Excretion',
    'Coordination and response',
    'Reproduction',
    'Inheritance',
    'Variation and selection'
  ],
  'IGCSE Chemistry': [
    'States of matter',
    'Atoms, elements and compounds',
    'Stoichiometry',
    'Electrochemistry',
    'Chemical energetics',
    'Chemical reactions',
    'Acids, bases and salts',
    'The Periodic Table',
    'Metals',
    'Organic chemistry'
  ],
  'IGCSE Physics': [
    'Motion, forces and energy',
    'Thermal physics',
    'Waves',
    'Electricity and magnetism',
    'Atomic physics',
    'Forces and motion',
    'Energy resources',
    'Sound',
    'Light',
    'Radioactivity'
  ],
  'AS Chemistry': [
    'Atomic Structure',
    'Chemical Bonding',
    'States of Matter',
    'Chemical Energetics',
    'Electrochemistry',
    'Equilibria',
    'Reaction Kinetics',
    'Periodic Table',
    'Organic Chemistry'
  ],
  'AS Physics': [
    'Physical quantities and units',
    'Kinematics',
    'Dynamics',
    'Forces, density and pressure',
    'Work, energy and power',
    'Deformation of solids',
    'Waves',
    'Electricity',
    'DC circuits'
  ],
  'AS Mathematics': [
    'Algebra',
    'Functions',
    'Coordinate Geometry',
    'Trigonometry',
    'Differentiation',
    'Integration',
    'Vectors',
    'Probability',
    'Statistics'
  ],
  'A Level Chemistry': [
    'Chemical Energetics',
    'Electrochemistry',
    'Equilibria',
    'Reaction Kinetics',
    'Transition Elements',
    'Organic Chemistry',
    'Polymerisation',
    'Analytical Techniques'
  ],
  'A Level Physics': [
    'Motion in a circle',
    'Gravitational fields',
    'Oscillations',
    'Electric fields',
    'Capacitance',
    'Magnetic fields',
    'Alternating currents',
    'Quantum physics',
    'Nuclear physics'
  ]
};
