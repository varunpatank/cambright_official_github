export interface Question {
  id: string;
  paperId: string;
  questionNumber: string;
  questionText: string;
  questionType: 'MCQ' | 'FRQ' | 'STRUCTURED_PART';
  marks: string;
  difficulty: string;
  topic?: string;
}

export interface MCQOption {
  id: string;
  questionId: string;
  optionLetter: string;
  optionText: string;
  isCorrect: string;
}

export interface MarkSchemeEntry {
  id: string;
  questionId: string;
  answerText: string;
  marksAwarded: string;
  keywords: string;
}

export interface Paper {
  id: string;
  year: string;
  session: string;
  variant: string;
  subject: string;
  paperType: string;
}

export interface QuizQuestion {
  question: Question;
  options?: MCQOption[];
  markScheme?: MarkSchemeEntry;
  paper?: Paper;
}

export interface TopicQuestionCount {
  topic: string;
  count: number;
}

export interface QuizSettings {
  level: 'IGCSE' | 'AS Level' | 'A Level';
  subject: 'Biology' | 'Chemistry' | 'Physics' | 'Mathematics' | 'English Language' | 'English Literature' | 'History' | 'Geography' | 'Economics' | 'Business Studies' | 'Accounting' | 'Computer Science' | 'Art & Design' | 'Design & Technology' | 'Food & Nutrition' | 'Physical Education' | 'Music' | 'Drama';
  yearRange: { from: string; to: string };
  topics: string[];
  topicQuestions: TopicQuestionCount[];
  variant: string;
  session: string;
  boardType: string;
  difficulty: string;
  paper: string;
  numberOfQuestions: number;
  timeLimit: number; // in minutes
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  marksAwarded: number;
  keywords?: string[];
}

export interface SubjectData {
  questions: Question[];
  mcqOptions: MCQOption[];
  markScheme: MarkSchemeEntry[];
  papers: Paper[];
}

export interface GeneratedQuizQuestion {
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