import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA9Zx29iw14QaHTSwFwK6NuBcmZ9gUrd_I';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GenerationProgress {
  currentStep: number;
  totalSteps: number;
  currentTopic: string;
  status: string;
  percentage: number;
}

export interface GeneratedQuestion {
  id: string;
  questionText: string;
  questionType: 'MCQ' | 'FRQ';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  marks: number;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
    correct: 'A' | 'B' | 'C' | 'D';
  };
  markScheme: {
    answer: string;
    keywords: string[];
    guidance: string;
  };
}

export const IGCSE_TOPICS = {
  Biology: [
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
    'Drugs',
    'Reproduction',
    'Inheritance',
    'Variation and selection',
    'Organisms and environment'
  ],
  Chemistry: [
    'States of matter',
    'Atoms, elements and compounds',
    'Stoichiometry',
    'Electrochemistry',
    'Chemical energetics',
    'Chemical reactions',
    'Acids, bases and salts',
    'The Periodic Table',
    'Metals',
    'Chemistry of the environment',
    'Organic chemistry',
    'Chemical bonding',
    'Rates of reaction',
    'Equilibrium'
  ],
  Physics: [
    'Motion, forces and energy',
    'Thermal physics',
    'Waves',
    'Electricity and magnetism',
    'Atomic physics',
    'Forces and motion',
    'Energy resources',
    'Solids, liquids and gases',
    'Sound',
    'Light',
    'Electromagnetic spectrum',
    'Radioactivity'
  ],
  Mathematics: [
    'Number',
    'Algebra',
    'Geometry',
    'Mensuration',
    'Coordinate geometry',
    'Trigonometry',
    'Matrices and transformations',
    'Probability',
    'Statistics',
    'Sets',
    'Functions',
    'Calculus basics'
  ],
  'English Language': [
    'Reading comprehension',
    'Summary writing',
    'Directed writing',
    'Continuous writing',
    'Language use',
    'Vocabulary',
    'Grammar',
    'Punctuation',
    'Text analysis',
    'Creative writing',
    'Formal writing',
    'Informal writing'
  ],
  'English Literature': [
    'Poetry analysis',
    'Prose analysis',
    'Drama analysis',
    'Character study',
    'Theme analysis',
    'Literary devices',
    'Context and background',
    'Comparative analysis',
    'Critical appreciation',
    'Unseen texts',
    'Set texts study',
    'Writing techniques'
  ],
  History: [
    'The First World War',
    'The Russian Revolution',
    'Germany 1918-1945',
    'The USA 1919-1941',
    'China 1945-1990',
    'The Cold War',
    'Decolonization',
    'International relations',
    'Social and economic history',
    'Political developments',
    'Historical sources',
    'Causation and consequence'
  ],
  Geography: [
    'Population and settlement',
    'The natural environment',
    'Economic development',
    'Plate tectonics',
    'Weather and climate',
    'Rivers and coasts',
    'Natural hazards',
    'Agriculture and food supply',
    'Industry',
    'Tourism',
    'Urban environments',
    'Development and inequality'
  ],
  Economics: [
    'Basic economic problem',
    'Allocation of resources',
    'Microeconomic decision makers',
    'Government and the macroeconomy',
    'Economic development',
    'International trade',
    'Market failure',
    'Money and banking',
    'Fiscal policy',
    'Monetary policy',
    'Economic indicators',
    'Globalization'
  ],
  'Business Studies': [
    'Understanding business activity',
    'People in business',
    'Marketing',
    'Operations management',
    'Financial information',
    'External influences on business',
    'Business planning',
    'Human resources',
    'Production methods',
    'Quality management',
    'Business finance',
    'International business'
  ],
  Accounting: [
    'Double entry bookkeeping',
    'Verification of accounting records',
    'Financial statements',
    'Accounting principles',
    'Incomplete records',
    'Control accounts',
    'Partnership accounts',
    'Company accounts',
    'Manufacturing accounts',
    'Ratio analysis',
    'Budgeting',
    'Cash flow statements'
  ],
  'Computer Science': [
    'Data representation',
    'Communication and internet technologies',
    'Hardware and software',
    'Security',
    'Ethics',
    'Database design',
    'Algorithm design',
    'Programming',
    'System life cycle',
    'Binary systems',
    'Logic gates',
    'Computer architecture'
  ],
  'Art & Design': [
    'Drawing techniques',
    'Painting methods',
    'Printmaking',
    'Sculpture',
    'Digital art',
    'Art history',
    'Visual elements',
    'Design principles',
    'Cultural contexts',
    'Personal response',
    'Critical analysis',
    'Portfolio development'
  ],
  'Design & Technology': [
    'Design process',
    'Materials and components',
    'Manufacturing processes',
    'Quality control',
    'Health and safety',
    'Sustainability',
    'Computer-aided design',
    'Product analysis',
    'Testing and evaluation',
    'Innovation',
    'User-centered design',
    'Technical drawing'
  ],
  'Food & Nutrition': [
    'Nutrients and their functions',
    'Food sources',
    'Meal planning',
    'Food preparation',
    'Food safety',
    'Food preservation',
    'Special dietary needs',
    'Food production',
    'Food technology',
    'Consumer awareness',
    'Cultural influences',
    'Health and diet'
  ],
  'Physical Education': [
    'Anatomy and physiology',
    'Health and fitness',
    'Skill acquisition',
    'Sports psychology',
    'Training methods',
    'Biomechanics',
    'Sports nutrition',
    'Injury prevention',
    'Rules and regulations',
    'Sports analysis',
    'Leadership in sport',
    'Contemporary issues'
  ],
  Music: [
    'Musical elements',
    'Composition techniques',
    'Performance skills',
    'Music theory',
    'Listening and analysis',
    'Music history',
    'World music',
    'Technology in music',
    'Improvisation',
    'Ensemble work',
    'Music notation',
    'Cultural contexts'
  ],
  Drama: [
    'Acting techniques',
    'Script analysis',
    'Character development',
    'Stagecraft',
    'Directing',
    'Theatre history',
    'Performance styles',
    'Technical theatre',
    'Devising',
    'Voice and movement',
    'Design elements',
    'Critical evaluation'
  ]
};

export async function generateQuestions(
  subject: string,
  topic: string,
  difficulty: string,
  questionType: 'MCQ' | 'FRQ',
  numberOfQuestions: number,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedQuestion[]> {
  if (onProgress) {
    onProgress({
      currentStep: 1,
      totalSteps: 3,
      currentTopic: topic,
      status: `Preparing ${questionType} questions for ${topic}...`,
      percentage: 10
    });
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate ${numberOfQuestions} IGCSE ${subject} questions for the topic "${topic}" based on Cambridge past papers. 

CRITICAL REQUIREMENTS:
- Difficulty: ${difficulty}
- Question Type: ${questionType}
- Topic: ${topic}
- NO questions requiring diagrams, drawings, graphs, or visual elements
- Questions should be text-based only
- Follow IGCSE marking standards
- Based on authentic Cambridge past paper style

${questionType === 'MCQ' ? `
FOR MCQ QUESTIONS - MANDATORY FORMAT:
- Provide exactly 4 options labeled A, B, C, D
- Each option must be a complete, clear answer
- Mark ONE option as correct using "correct": "A" (or B, C, D)
- Ensure all options are plausible but only one is correct
- No undefined or empty options allowed
- ALL OPTIONS MUST BE FILLED WITH VALID TEXT
` : `
FOR FRQ QUESTIONS:
- Provide clear question text
- Mark allocation (1-6 marks)
- Detailed mark scheme with specific keywords
- One keyword per mark awarded
`}

MANDATORY JSON FORMAT - NO DEVIATIONS:
[
  {
    "id": "${subject}_${topic.replace(/\s+/g, '_')}_${questionType}_${Date.now()}_1",
    "questionText": "Complete question text here",
    "questionType": "${questionType}",
    "difficulty": "${difficulty}",
    "topic": "${topic}",
    "marks": 1,
    ${questionType === 'MCQ' ? `
    "options": {
      "A": "Complete option A text",
      "B": "Complete option B text", 
      "C": "Complete option C text",
      "D": "Complete option D text",
      "correct": "A"
    },` : ''}
    "markScheme": {
      "answer": "Complete correct answer or explanation",
      "keywords": ["keyword1", "keyword2"],
      "guidance": "Detailed marking guidance"
    }
  }
]

Generate authentic IGCSE-style questions that match Cambridge past paper standards. Ensure ALL fields are properly filled with no undefined values.`;

  try {
    if (onProgress) {
      onProgress({
        currentStep: 2,
        totalSteps: 3,
        currentTopic: topic,
        status: `CamBright Intelligence generating ${numberOfQuestions} questions...`,
        percentage: 40
      });
    }

    console.log(`🧠 CamBright Intelligence generating ${numberOfQuestions} ${questionType} questions for ${subject} - ${topic} (${difficulty})`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (onProgress) {
      onProgress({
        currentStep: 3,
        totalSteps: 3,
        currentTopic: topic,
        status: `Processing and validating questions...`,
        percentage: 70
      });
    }
    
    console.log('Raw CamBright response:', text.substring(0, 500) + '...');
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      throw new Error('No valid JSON found in response');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    // Validate and clean questions with strict MCQ validation
    const validatedQuestions = questions.map((q: any, index: number) => {
      const baseQuestion = {
        id: q.id || `${subject}_${topic.replace(/\s+/g, '_')}_${questionType}_${Date.now()}_${index}`,
        questionText: q.questionText || 'Question text not provided',
        questionType: q.questionType,
        difficulty: q.difficulty,
        topic: q.topic || topic,
        marks: q.marks || 1,
        markScheme: q.markScheme || {
          answer: 'Answer not provided',
          keywords: [],
          guidance: 'No guidance provided'
        }
      };

      // Special validation for MCQ questions
      if (q.questionType === 'MCQ') {
        // Ensure all options exist and are valid
        const options = q.options || {};
        const validOptions = {
          A: options.A || 'Option A not provided',
          B: options.B || 'Option B not provided',
          C: options.C || 'Option C not provided',
          D: options.D || 'Option D not provided',
          correct: options.correct || 'A'
        };

        // Validate correct answer is one of A, B, C, D
        if (!['A', 'B', 'C', 'D'].includes(validOptions.correct)) {
          validOptions.correct = 'A';
        }

        return {
          ...baseQuestion,
          options: validOptions
        };
      }

      return baseQuestion;
    });
    
    console.log(`✅ CamBright Intelligence successfully generated ${validatedQuestions.length} questions for ${topic}`);
    
    if (onProgress) {
      onProgress({
        currentStep: 3,
        totalSteps: 3,
        currentTopic: topic,
        status: `Completed ${validatedQuestions.length} questions for ${topic}`,
        percentage: 100
      });
    }
    
    return validatedQuestions;
    
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
}

export async function generateMixedQuestions(
  subject: string,
  topicQuestions: { topic: string; count: number }[],
  difficulty: string,
  questionType: 'MCQ' | 'FRQ' | 'Mixed',
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedQuestion[]> {
  const allQuestions: GeneratedQuestion[] = [];
  const totalTopics = topicQuestions.filter(tq => tq.count > 0).length;
  let completedTopics = 0;
  
  for (const { topic, count } of topicQuestions) {
    if (count === 0) continue;
    
    const topicProgress = (progress: GenerationProgress) => {
      const overallPercentage = ((completedTopics / totalTopics) * 100) + (progress.percentage / totalTopics);
      if (onProgress) {
        onProgress({
          ...progress,
          percentage: Math.min(overallPercentage, 95)
        });
      }
    };
    
    try {
      let questions: GeneratedQuestion[];
      
      if (questionType === 'Mixed') {
        const mcqCount = Math.ceil(count * 0.6);
        const frqCount = count - mcqCount;
        
        if (onProgress) {
          topicProgress({
            currentStep: 1,
            totalSteps: 2,
            currentTopic: topic,
            status: `Generating mixed questions for ${topic}...`,
            percentage: 0
          });
        }
        
        const [mcqQuestions, frqQuestions] = await Promise.all([
          mcqCount > 0 ? generateQuestions(subject, topic, difficulty, 'MCQ', mcqCount, topicProgress) : Promise.resolve([]),
          frqCount > 0 ? generateQuestions(subject, topic, difficulty, 'FRQ', frqCount, topicProgress) : Promise.resolve([])
        ]);
        
        questions = [...mcqQuestions, ...frqQuestions];
      } else {
        questions = await generateQuestions(subject, topic, difficulty, questionType, count, topicProgress);
      }
      
      allQuestions.push(...questions);
      completedTopics++;
      
    } catch (error) {
      console.error(`Failed to generate questions for topic: ${topic}`, error);
      completedTopics++;
      // Continue with other topics even if one fails
    }
  }
  
  if (onProgress) {
    onProgress({
      currentStep: totalTopics,
      totalSteps: totalTopics,
      currentTopic: 'All topics',
      status: `Quiz ready! Generated ${allQuestions.length} questions`,
      percentage: 100
    });
  }
  
  return allQuestions;
}