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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md w-full px-6">
          <div className="w-16 h-16 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          
          <h2 className="text-2xl font-bold font-sora mb-2">Generating Your Quiz</h2>
          <p className="text-gray-400 mb-6">CamBright Intelligence is creating authentic {quizSettings?.level || 'IGCSE'} questions</p>
          
          {generationProgress && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress.percentage}%` }}
                ></div>
              </div>
              
              {/* Progress Text */}
              <div className="text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Progress</span>
                  <span className="text-sm font-mono text-purple-400">
                    {Math.round(generationProgress.percentage)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Step</span>
                  <span className="text-sm font-mono text-blue-400">
                    {generationProgress.currentStep} / {generationProgress.totalSteps}
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm text-gray-400 mb-1">Current Topic:</div>
                  <div className="text-purple-300 font-medium">{generationProgress.currentTopic}</div>
                </div>
                
                <div className="mt-3">
                  <div className="text-sm text-gray-400 mb-1">Status:</div>
                  <div className="text-green-400 text-sm">{generationProgress.status}</div>
                </div>
              </div>
            </div>
          )}
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