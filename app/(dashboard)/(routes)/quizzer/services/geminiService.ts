// OpenRouter API for quiz generation with Gemma 3

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-3-4b-it:free';

// Helper function to call OpenRouter API
async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  // Gemma 3 doesn't support system role, so we prepend instructions to the user message
  const systemContext = '[INSTRUCTIONS: You are an expert IGCSE and A-Level question generator. Generate high-quality questions based on Cambridge past paper standards. Always respond with valid JSON only. Do not include any text before or after the JSON array.]\n\n';

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cambright.org',
      'X-Title': 'Cambright Quiz Generator'
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

// Function to clean mathematical notation and remove LaTeX
function cleanMathematicalNotation(text: string): string {
  if (!text) return text;
  
  // Replace common LaTeX expressions with plain text equivalents
  let cleaned = text
    // Replace fractions: \frac{a}{b} -> a/b
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Replace square roots: \sqrt{x} -> sqrt(x)
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    // Replace superscripts: x^{2} -> x^2
    .replace(/\^\{([^}]+)\}/g, '^$1')
    // Replace subscripts: x_{2} -> x_2
    .replace(/\_\{([^}]+)\}/g, '_$1')
    // Remove other LaTeX commands
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    // Remove remaining LaTeX backslashes
    .replace(/\\([a-zA-Z])/g, '$1')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
    
  return cleaned;
}

// Function to validate and filter mathematical keywords
function filterMathematicalKeywords(keywords: string[], subject: string): string[] {
  if (subject !== 'Mathematics') return keywords;
  
  return keywords.filter(keyword => {
    const cleaned = keyword.toLowerCase().trim();
    
    // Exclude abstract mathematical terms
    const abstractTerms = [
      'differentiation', 'integration', 'calculus', 'trigonometry',
      'algebra', 'geometry', 'statistics', 'probability', 'function',
      'equation', 'graph', 'plot', 'sketch', 'draw', 'find', 'calculate',
      'solve', 'determine', 'evaluate', 'simplify', 'expand', 'factor'
    ];
    
    // Check if keyword is an abstract term
    if (abstractTerms.includes(cleaned)) return false;
    
    // Allow numerical values, mathematical expressions, and specific terms
    const mathPattern = /^[0-9x-z\+\-\*/\^()=<>.,\s]*$|^(sin|cos|tan|log|ln|sqrt|pi|e).*$/i;
    return mathPattern.test(cleaned) || cleaned.length <= 5;
  });
}

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

export const AS_TOPICS: Record<string, string[]> = {
  Biology: [
    'Cell structure',
    'Biological molecules',
    'Enzymes',
    'Cell membranes and transport',
    'Cell and nuclear division',
    'Genetic control',
    'DNA and protein synthesis',
    'Transport in plants',
    'Transport in mammals',
    'Gas exchange and smoking',
    'Infectious disease',
    'Immunity'
  ],
  Chemistry: [
    'Atoms, molecules and stoichiometry',
    'Atomic structure',
    'Chemical bonding',
    'States of matter',
    'Chemical energetics',
    'Electrochemistry',
    'Equilibria',
    'Reaction kinetics',
    'The periodic table: chemical periodicity',
    'Group 2',
    'Group 17',
    'Nitrogen and sulfur',
    'Introduction to organic chemistry',
    'Hydrocarbons',
    'Halogen derivatives',
    'Hydroxy compounds',
    'Carbonyl compounds',
    'Carboxylic acids and derivatives'
  ],
  Physics: [
    'Physical quantities and units',
    'Kinematics',
    'Dynamics',
    'Forces, density and pressure',
    'Work, energy and power',
    'Deformation of solids',
    'Waves',
    'Superposition',
    'Electric fields',
    'Current of electricity',
    'D.C. circuits',
    'Nuclear physics'
  ],
  Mathematics: [
    'Quadratics',
    'Functions',
    'Coordinate geometry',
    'Circular measure',
    'Trigonometry',
    'Series',
    'Differentiation',
    'Integration',
    'Numerical solutions of equations',
    'Vectors',
    'Probability',
    'Discrete random variables'
  ],
  Economics: [
    'Basic economic ideas and resource allocation',
    'The price system and the microeconomy',
    'Government microeconomic intervention',
    'The macroeconomy',
    'Government macroeconomic intervention',
    'International economic issues',
    'Aggregate demand and supply',
    'Money supply',
    'Economic growth and sustainability'
  ],
  'Business Studies': [
    'Business and its environment',
    'Human resource management',
    'Marketing',
    'Operations and project management',
    'Finance and accounting',
    'Strategic management',
    'Business planning',
    'Market analysis',
    'Organisational structure'
  ],
  Psychology: [
    'Research methods',
    'The biological approach',
    'The cognitive approach',
    'The learning approach',
    'The social approach',
    'Issues and debates',
    'Stress',
    'Abnormality',
    'Consumer psychology'
  ],
  Sociology: [
    'The sociological perspective',
    'Socialisation',
    'Research methods',
    'Social inequality',
    'Family',
    'Education',
    'Media',
    'Crime and deviance'
  ],
  'Computer Science': [
    'Information representation',
    'Communication and Internet technologies',
    'Hardware',
    'Processor fundamentals',
    'System software',
    'Security, privacy and data integrity',
    'Ethics and ownership',
    'Database and data modelling',
    'Algorithm design and problem-solving',
    'Data types and structures',
    'Programming',
    'Software development'
  ],
  Law: [
    'English legal system',
    'Law making',
    'Criminal law',
    'Law of tort',
    'Contract law',
    'Human rights',
    'Legal personnel',
    'Statutory interpretation'
  ],
  'English Language': [
    'Language and the individual',
    'Language and society',
    'Language acquisition',
    'Language change',
    'Child language development',
    'World Englishes',
    'Spoken language analysis',
    'Written language analysis',
    'Language and power',
    'Language and gender'
  ],
  'English Literature': [
    'Drama and poetry pre-1900',
    'Drama and poetry post-1900',
    'Prose fiction',
    'Shakespeare',
    'Critical anthology',
    'Comparative literary study',
    'Close reading skills',
    'Contextual study'
  ],
  History: [
    'Modern European history 1789-1870',
    'The history of the USA 1820-1941',
    'International history 1870-1945',
    'The Cold War 1945-1991',
    'Source-based study',
    'Interpretations of history',
    'Essay writing skills'
  ],
  Geography: [
    'Hydrology and fluvial geomorphology',
    'Atmosphere and weather',
    'Rocks and weathering',
    'Population',
    'Migration',
    'Settlement dynamics',
    'Coastal environments',
    'Hazardous environments',
    'Hot arid and semi-arid environments',
    'Tropical environments'
  ],
  Accounting: [
    'Financial accounting fundamentals',
    'The regulatory framework',
    'Preparation of financial statements',
    'Limited company accounts',
    'Analysis and interpretation',
    'Costing methods',
    'Budgeting',
    'Investment appraisal'
  ],
  'Art & Design': [
    'Personal investigation',
    'Externally set assignment',
    'Critical and contextual studies',
    'Drawing and painting',
    'Mixed media',
    'Digital art and photography',
    'Three-dimensional design',
    'Art history and theory'
  ],
  'Design & Technology': [
    'Identifying and investigating design possibilities',
    'Design development',
    'Material categories and properties',
    'Manufacturing processes',
    'Industrial manufacturing',
    'Design communication',
    'Quality and safety',
    'Sustainability and the environment'
  ],
  'Food & Nutrition': [
    'Macronutrients',
    'Micronutrients',
    'Nutritional needs and health',
    'Diet and health',
    'Food science',
    'Food safety',
    'Food production and processing',
    'Food choice'
  ],
  'Physical Education': [
    'Applied anatomy and physiology',
    'Skill acquisition',
    'Sport psychology',
    'Sport and society',
    'Exercise physiology',
    'Biomechanical movement',
    'Technology in sport',
    'Practical performance'
  ],
  Music: [
    'Performance',
    'Composition',
    'Listening and appraising',
    'Western classical tradition',
    'Jazz',
    'Musical theatre',
    'Contemporary music',
    'World music traditions'
  ],
  Drama: [
    'Component 1: Drama and theatre',
    'Component 2: Creating original drama',
    'Live theatre evaluation',
    'Practitioners and theatre makers',
    'Set text study',
    'Performance skills',
    'Design elements',
    'Theatre history'
  ]
};

export const A_LEVEL_TOPICS: Record<string, string[]> = {
  Biology: [
    'Energy and respiration',
    'Photosynthesis',
    'Homeostasis',
    'Control and coordination',
    'Inherited change',
    'Selection and evolution',
    'Biodiversity, classification and conservation',
    'Genetic technology',
    'Ecosystems',
    'Biotechnology and bioinformatics'
  ],
  Chemistry: [
    'Chemical energetics (advanced)',
    'Electrochemistry (advanced)',
    'Equilibria (advanced)',
    'Reaction kinetics (advanced)',
    'Group 2 and Group 17 reactions',
    'Transition elements',
    'Organic synthesis',
    'Carboxylic acids and derivatives',
    'Nitrogen compounds',
    'Polymerisation',
    'Analytical techniques',
    'Organic synthesis routes'
  ],
  Physics: [
    'Gravitational fields',
    'Ideal gases',
    'Temperature',
    'Thermal properties of materials',
    'Oscillations',
    'Electric fields (advanced)',
    'Capacitance',
    'Magnetic fields',
    'Alternating currents',
    'Quantum physics',
    'Nuclear physics (advanced)',
    'Medical imaging',
    'Astronomy and cosmology'
  ],
  Mathematics: [
    'Further algebra',
    'Further calculus',
    'Further trigonometry',
    'Further differentiation',
    'Further integration',
    'Differential equations',
    'Complex numbers',
    'Numerical methods',
    'Vectors in 3D',
    'Continuous random variables',
    'Normal distribution',
    'Sampling and hypothesis testing'
  ],
  'Further Mathematics': [
    'Roots of polynomial equations',
    'Rational functions',
    'Summation of series',
    'Matrices',
    'Polar coordinates',
    'Hyperbolic functions',
    'Differential equations (advanced)',
    'Complex numbers (advanced)',
    'Mechanics',
    'Probability generating functions'
  ],
  Economics: [
    'The price system and the microeconomy (advanced)',
    'Government microeconomic intervention (advanced)',
    'The macroeconomy (advanced)',
    'Government macroeconomic policy',
    'International economic issues (advanced)',
    'Development economics',
    'Market failure and government failure',
    'Theory of the firm'
  ],
  Psychology: [
    'Research methods (advanced)',
    'The biological approach (advanced)',
    'The cognitive approach (advanced)',
    'The learning approach (advanced)',
    'The social approach (advanced)',
    'Issues and debates (advanced)',
    'Clinical psychology',
    'Consumer psychology (advanced)',
    'Organisational psychology'
  ],
  'Computer Science': [
    'Data representation (advanced)',
    'Communication and Internet technologies (advanced)',
    'Hardware and virtual machines',
    'System software (advanced)',
    'Security (advanced)',
    'Artificial intelligence',
    'Computational thinking and problem-solving',
    'Further programming',
    'Object-oriented programming'
  ],
  Law: [
    'English legal system (advanced)',
    'Criminal law (advanced)',
    'Law of tort (advanced)',
    'Contract law (advanced)',
    'Law of murder',
    'Voluntary and involuntary manslaughter',
    'Defences',
    'Sentencing',
    'Evaluation of law'
  ],
  History: [
    'Modern European history 1789-1917',
    'The history of the USA 1840-1941',
    'International history 1945-1991',
    'Modern British history',
    'African and Asian history',
    'Historical interpretation',
    'Source analysis',
    'Extended essay writing'
  ],
  Sociology: [
    'Education with theory and methods',
    'Families and households',
    'Health with theory and methods',
    'Work, poverty and welfare',
    'Beliefs in society',
    'Global development',
    'Crime and deviance with theory',
    'Stratification and differentiation'
  ],
  'English Language': [
    'Language, the individual and society',
    'Language diversity and change',
    'Language in action',
    'Writing about a topical language issue',
    'Original writing and commentary',
    'Language investigation',
    'Child language acquisition (advanced)',
    'World Englishes (advanced)'
  ],
  'English Literature': [
    'Love through the ages',
    'Texts in shared contexts',
    'Independent critical study',
    'Tragedy',
    'Political and social protest writing',
    'Modern times literature 1945-present',
    'Unseen poetry comparison',
    'Coursework: two texts'
  ],
  Geography: [
    'Coastal systems and landscapes',
    'Glacial systems and landscapes',
    'Hazards',
    'Ecosystems under stress',
    'Global systems and global governance',
    'Changing places',
    'Contemporary urban environments',
    'Population and the environment',
    'Resource security',
    'Geographical skills and fieldwork'
  ],
  Accounting: [
    'Financial accounting (advanced)',
    'Cost and management accounting',
    'Auditing',
    'Financial statement analysis',
    'Business finance and taxation',
    'Integrated reporting',
    'Corporate governance',
    'Strategic management accounting'
  ],
  'Business Studies': [
    'Business objectives and strategy',
    'External environment',
    'Marketing strategy',
    'Operational strategy',
    'Human resource strategy',
    'Financial strategy',
    'Managing change',
    'Business ethics and sustainability'
  ],
  'Art & Design': [
    'Personal investigation (extended)',
    'Externally set assignment (advanced)',
    'Related study: critical essay',
    'Specialised techniques',
    'Art movements and influences',
    'Contemporary art practice',
    'Exhibition and presentation',
    'Portfolio development'
  ],
  'Design & Technology': [
    'Principles of design and technology',
    'Problem solving and prototyping',
    'Materials selection and testing',
    'Digital design and manufacture',
    'Iterative design process',
    'Enterprise and marketing',
    'Responsible design',
    'Non-examined assessment (NEA)'
  ],
  'Food & Nutrition': [
    'Food, nutrition and health (advanced)',
    'Food science and technology',
    'Contemporary food issues',
    'Food manufacturing',
    'Food safety and quality',
    'Sensory analysis',
    'Recipe development',
    'Non-examined assessment (NEA)'
  ],
  'Physical Education': [
    'Applied anatomy and physiology (advanced)',
    'Exercise physiology (advanced)',
    'Biomechanics (advanced)',
    'Skill acquisition (advanced)',
    'Sport psychology (advanced)',
    'Sport and society and technology in sport',
    'Evaluation and appreciation of performance',
    'Coursework and practical performance'
  ],
  Music: [
    'Performing (advanced)',
    'Composing (advanced)',
    'Appraising',
    'Area of study 1: Western classical tradition',
    'Area of study 2: Pop and jazz',
    'Area of study 3: Music for media',
    'Area of study 4: Contemporary traditional music',
    'Extended analysis and evaluation'
  ],
  Drama: [
    'Drama and theatre (advanced)',
    'Creating original drama (devised)',
    'Making theatre: text in performance',
    'Practitioners study (advanced)',
    'Live theatre production',
    'Directing concepts',
    'Design realisation',
    'Reflective report and analysis'
  ]
};

export async function generateQuestions(
  subject: string,
  topic: string,
  difficulty: string,
  questionType: 'MCQ' | 'FRQ',
  numberOfQuestions: number,
  onProgress?: (progress: GenerationProgress) => void,
  level: 'IGCSE' | 'AS Level' | 'A Level' = 'IGCSE'
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

  const levelDescription = level === 'IGCSE' 
    ? 'IGCSE (Cambridge International General Certificate of Secondary Education)' 
    : level === 'AS Level' 
    ? 'AS Level (Cambridge International Advanced Subsidiary)' 
    : 'A Level (Cambridge International Advanced Level)';

  const prompt = `Generate ${numberOfQuestions} ${level} ${subject} questions for the topic "${topic}" based on Cambridge past papers. 

CRITICAL REQUIREMENTS:
- Qualification Level: ${levelDescription}
- Difficulty: ${difficulty}
- Question Type: ${questionType}
- Topic: ${topic}
- NO questions requiring diagrams, drawings, graphs, or visual elements
- Questions should be text-based only
- Follow ${level} marking standards and difficulty expectations
- Based on authentic Cambridge ${level} past paper style
${level === 'A Level' ? '- Questions should be more challenging and require deeper understanding' : ''}
${level === 'AS Level' ? '- Questions should bridge IGCSE and A Level complexity' : ''}

MATHEMATICAL NOTATION RULES:
- Use ^ for exponents (e.g., x^2, 2^3, e^x)
- NO LaTeX formatting (\\frac, \\sqrt, etc.) - use plain text alternatives
- Use / for division (e.g., dy/dx instead of \\frac{dy}{dx})
- Use sqrt() for square roots (e.g., sqrt(x) instead of \\sqrt{x})
- For fractions: write as a/b not \\frac{a}{b}
- Use plain text mathematical notation only

${subject === 'Mathematics' ? `
MATHEMATICS SPECIFIC RULES:
- Keywords should be numerical values, mathematical terms, or algebraic expressions only
- NO abstract words like "differentiation", "integration", "calculus"
- Use specific values, equations, or mathematical symbols
- Examples of good keywords: "2x", "x^2", "dy/dx", "sin(x)", "cos(x)", "pi", "e"
- Examples of bad keywords: "differentiation", "integration", "calculus", "trigonometry"
` : ''}

CALCULATION QUESTIONS - CRITICAL MARKING RULES:
- For ANY question involving calculations (Mathematics, Physics, Chemistry, Economics, Accounting, etc.):
  * Keywords MUST include the specific numerical answer (e.g., "42", "3.5", "150 N", "$2400")
  * Keywords MUST include key intermediate values from calculation steps
  * Each numerical step that awards a mark should have its value as a keyword
  * Include units where applicable (e.g., "25 m/s", "100 J", "2.5 mol")
- Example for a Physics calculation worth 3 marks:
  * Question: "Calculate the force..."
  * Keywords: ["F = ma", "120", "120 N"] (formula, calculation, final answer with unit)
- Example for an Accounting question worth 4 marks:
  * Keywords: ["5000", "1200", "3800", "$3800"] (intermediate values + final answer)

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
- For calculation questions: keywords MUST be numerical values (answers and intermediate steps)
- For definition questions: keywords should be key terms from the definition
- For explanation questions: keywords should be specific concepts that must be mentioned
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

Generate authentic ${level}-style questions that match Cambridge past paper standards. Ensure ALL fields are properly filled with no undefined values. Return ONLY the JSON array, no other text.`;

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
    
    const text = await callOpenRouter(prompt);
    
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
        questionText: cleanMathematicalNotation(q.questionText || 'Question text not provided'),
        questionType: q.questionType,
        difficulty: q.difficulty,
        topic: q.topic || topic,
        marks: q.marks || 1,
        markScheme: {
          answer: cleanMathematicalNotation(q.markScheme?.answer || 'Answer not provided'),
          keywords: filterMathematicalKeywords(
            (q.markScheme?.keywords || []).map((k: string) => cleanMathematicalNotation(k)),
            subject
          ),
          guidance: cleanMathematicalNotation(q.markScheme?.guidance || 'No guidance provided')
        }
      };

      // Special validation for MCQ questions
      if (q.questionType === 'MCQ') {
        // Ensure all options exist and are valid
        const options = q.options || {};
        const validOptions = {
          A: cleanMathematicalNotation(options.A || 'Option A not provided'),
          B: cleanMathematicalNotation(options.B || 'Option B not provided'),
          C: cleanMathematicalNotation(options.C || 'Option C not provided'),
          D: cleanMathematicalNotation(options.D || 'Option D not provided'),
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
  onProgress?: (progress: GenerationProgress) => void,
  level: 'IGCSE' | 'AS Level' | 'A Level' = 'IGCSE'
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
          mcqCount > 0 ? generateQuestions(subject, topic, difficulty, 'MCQ', mcqCount, topicProgress, level) : Promise.resolve([]),
          frqCount > 0 ? generateQuestions(subject, topic, difficulty, 'FRQ', frqCount, topicProgress, level) : Promise.resolve([])
        ]);
        
        // Alternate between MCQ and FRQ questions
        const alternatedQuestions: GeneratedQuestion[] = [];
        const maxLength = Math.max(mcqQuestions.length, frqQuestions.length);
        for (let i = 0; i < maxLength; i++) {
          if (i < mcqQuestions.length) alternatedQuestions.push(mcqQuestions[i]);
          if (i < frqQuestions.length) alternatedQuestions.push(frqQuestions[i]);
        }
        questions = alternatedQuestions;
      } else {
        questions = await generateQuestions(subject, topic, difficulty, questionType, count, topicProgress, level);
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