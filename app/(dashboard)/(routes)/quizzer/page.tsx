"use client";

import React, { useState } from 'react';
import { QuizSetup } from './components/QuizSetup';
import { QuizInterface } from './components/QuizInterface';
import { QuizResults } from './components/QuizResults';
import { QuizSettings, UserAnswer, GeneratedQuizQuestion } from './types/quiz';
import { generateMixedQuestions, IGCSE_TOPICS, AS_TOPICS, A_LEVEL_TOPICS, GenerationProgress } from './services/geminiService';

type AppState = 'setup' | 'quiz' | 'results' | 'loading';

function App() {
  const [appState, setAppState] = useState<AppState>('setup');
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<UserAnswer[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);

  const handleStartQuiz = async (settings: QuizSettings) => {
    try {
      setAppState('loading');
      setError(null);
      setQuizSettings(settings);
      setGenerationProgress(null);
      
      console.log('🚀 Generating quiz with CamBright Intelligence:', settings);
      
      // Get the right topics based on level
      const topicsForLevel = settings.level === 'AS Level' ? AS_TOPICS : 
                             settings.level === 'A Level' ? A_LEVEL_TOPICS : 
                             IGCSE_TOPICS;
      
      // Handle random questions by selecting random topics
      const processedTopicQuestions = settings.topicQuestions.map(tq => {
        if (tq.topic === 'Random Mixed Topics') {
          const allTopics = topicsForLevel[settings.subject];
          const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
          return { topic: randomTopic, count: tq.count };
        }
        return tq;
      });
      
      const questions = await generateMixedQuestions(
        settings.subject,
        processedTopicQuestions,
        settings.difficulty,
        settings.paper === 'MCQ Only' ? 'MCQ' : 
        settings.paper === 'Theory Only' ? 'FRQ' : 'Mixed',
        setGenerationProgress,
        settings.level
      );
      
      if (questions.length === 0) {
        throw new Error('No questions were generated. Please try different settings.');
      }
      
      console.log(`✅ CamBright Intelligence generated ${questions.length} questions`);
      setCurrentQuiz(questions);
      setAppState('quiz');
      
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.');
      setGenerationProgress(null);
      setAppState('setup');
    }
  };

  const handleQuizComplete = (answers: UserAnswer[]) => {
    setQuizResults(answers);
    setAppState('results');
  };

  const handleRestart = () => {
    setAppState('setup');
    setCurrentQuiz([]);
    setQuizResults([]);
    setQuizSettings(null);
    setGenerationProgress(null);
    setGenerationProgress(null);
    setError(null);
  };

  const handleBackToSetup = () => {
    setAppState('setup');
    setGenerationProgress(null);
    setError(null);
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
        {/* Simplified Background Effects - Less GPU intensive */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 w-full max-w-5xl px-12 py-10">
          <div className="flex items-center gap-12">
            {/* Simplified Logo Animation */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 relative">
                {/* Simple Spinning Ring */}
                <svg className="absolute inset-0 w-28 h-28 animate-spin" style={{ animationDuration: '2s' }}>
                  <circle 
                    cx="56" cy="56" r="50" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="3" 
                    strokeDasharray="78 235"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Title and Description */}
            <div className="flex-1">
              <h2 className="text-5xl font-bold font-sora mb-2 text-white">
                Generating Your Quiz
              </h2>
              <p className="text-lg text-gray-400">
                CamBright Intelligence is crafting authentic <span className="text-purple-400 font-semibold">{quizSettings?.level || 'IGCSE'}</span> questions
              </p>
            </div>
          </div>
          
          {generationProgress && (
            <div className="space-y-8 mt-10">
              {/* Main Progress Bar */}
              <div className="relative">
                <div className="flex items-center justify-between text-base mb-3">
                  <span className="text-gray-400 font-medium">Overall Progress</span>
                  <span className="font-mono font-bold text-purple-400 text-xl">{Math.round(generationProgress.percentage)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-700 via-purple-500 to-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress.percentage}%` }}
                  />
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="flex gap-8">
                <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-sm text-gray-500 uppercase tracking-wider">Step</span>
                  <span className="text-2xl font-bold text-purple-400">{generationProgress.currentStep}/{generationProgress.totalSteps}</span>
                </div>
                <div className="flex items-center gap-4 px-6 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-sm text-gray-500 uppercase tracking-wider">Ready</span>
                  <span className="text-2xl font-bold text-purple-300">
                    {Math.floor((generationProgress.percentage / 100) * (quizSettings?.topicQuestions?.reduce((sum: number, tq: { count: number }) => sum + tq.count, 0) || 5))} questions
                  </span>
                </div>
              </div>
              
              {/* Current Topic - Compact */}
              <div className="flex items-center gap-5 p-5 rounded-xl bg-purple-900/10 border border-purple-500/20">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-purple-300 truncate">{generationProgress.currentTopic}</p>
                  <p className="text-sm text-gray-500">{generationProgress.status}</p>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
          
          {/* Subtle Branding */}
          <div className="mt-10 flex items-center justify-center gap-2 text-gray-600">
            <span className="text-xs">Powered by</span>
            <span className="text-xs font-semibold text-purple-400">CamBright Intelligence</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button 
            onClick={handleRestart}
            className="bg-purple-700 hover:bg-purple-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'setup') {
    return (
      <QuizSetup 
        onStartQuiz={handleStartQuiz} 
        availableSubjects={['Biology', 'Chemistry', 'Physics', 'Mathematics']} 
      />
    );
  }

  if (appState === 'quiz') {
    return (
      <QuizInterface 
        questions={currentQuiz} 
        onComplete={handleQuizComplete}
        onBack={handleBackToSetup}
        timeLimit={quizSettings?.timeLimit || 30}
        subject={quizSettings?.subject || ''}
      />
    );
  }

  if (appState === 'results') {
    return (
      <QuizResults 
        answers={quizResults}
        questions={currentQuiz}
        onRestart={handleRestart}
        onHome={handleRestart}
      />
    );
  }

  return null;
}

export default App;