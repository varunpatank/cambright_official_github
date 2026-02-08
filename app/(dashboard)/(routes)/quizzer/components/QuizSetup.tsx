import React, { useState } from 'react';
import { ChevronDown, Play, Check, Clock, Plus, Minus, Shuffle, GraduationCap } from 'lucide-react';
import { QuizSettings, TopicQuestionCount } from '../types/quiz';
import { IGCSE_TOPICS, AS_TOPICS, A_LEVEL_TOPICS } from '../services/geminiService';
import { Cover } from "@/components/ui/cover";
import { StarryBackground } from "@/components/ui/starry-background";

interface QuizSetupProps {
  onStartQuiz: (settings: QuizSettings) => void;
  availableSubjects: string[];
}

const LEVELS = ['IGCSE', 'AS Level', 'A Level'] as const;

export function QuizSetup({ onStartQuiz, availableSubjects }: QuizSetupProps) {
  const [settings, setSettings] = useState<QuizSettings>({
    level: 'IGCSE',
    subject: 'Biology' as any,
    yearRange: { from: '2020', to: 'present' },
    topics: [],
    topicQuestions: [],
    variant: 'Any',
    session: 'Any',
    boardType: 'Extended',
    difficulty: 'Medium',
    paper: 'Mixed (MCQ & Theory)',
    numberOfQuestions: 10,
    timeLimit: 30
  });

  const [randomQuestions, setRandomQuestions] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Include random questions in total
    const totalQuestions = settings.topicQuestions.reduce((sum, tq) => sum + tq.count, 0) + randomQuestions;
    if (totalQuestions === 0) {
      alert('Please select at least one topic or add random questions.');
      return;
    }
    
    // Add random topic if specified
    const finalTopicQuestions = [...settings.topicQuestions];
    if (randomQuestions > 0) {
      finalTopicQuestions.push({ topic: 'Random Mixed Topics', count: randomQuestions });
    }
    
    const finalSettings = {
      ...settings,
      topicQuestions: finalTopicQuestions,
      numberOfQuestions: totalQuestions
    };
    
    onStartQuiz(finalSettings);
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Biology': 'text-green-400',
      'Chemistry': 'text-blue-400',
      'Physics': 'text-orange-400',
      'Mathematics': 'text-purple-400',
      'English Language': 'text-pink-400',
      'English Literature': 'text-rose-400',
      'History': 'text-amber-400',
      'Geography': 'text-emerald-400',
      'Economics': 'text-yellow-400',
      'Business Studies': 'text-indigo-400',
      'Accounting': 'text-cyan-400',
      'Computer Science': 'text-teal-400',
      'Art & Design': 'text-red-400',
      'Design & Technology': 'text-lime-400',
      'Food & Nutrition': 'text-orange-300',
      'Physical Education': 'text-blue-300',
      'Music': 'text-violet-400',
      'Drama': 'text-fuchsia-400'
    };
    return colors[subject] || 'text-purple-400';
  };

  const getSubjectDescription = (subject: string) => {
    const descriptions: { [key: string]: string } = {
      'Biology': 'Study of living organisms and life processes',
      'Chemistry': 'Study of matter, atoms, and chemical reactions',
      'Physics': 'Study of matter, energy, and their interactions',
      'Mathematics': 'Numbers, algebra, geometry, and statistics',
      'English Language': 'Reading, writing, and communication skills',
      'English Literature': 'Analysis of poetry, prose, and drama',
      'History': 'Study of past events and their significance',
      'Geography': 'Physical and human geography studies',
      'Economics': 'Economic systems and decision making',
      'Business Studies': 'Business operations and management',
      'Accounting': 'Financial recording and analysis',
      'Computer Science': 'Programming and computational thinking',
      'Art & Design': 'Creative expression and visual arts',
      'Design & Technology': 'Design process and manufacturing',
      'Food & Nutrition': 'Food science and healthy eating',
      'Physical Education': 'Sports science and physical fitness',
      'Music': 'Musical theory and performance',
      'Drama': 'Theatre arts and performance skills'
    };
    return descriptions[subject] || 'Cambridge subject';
  };

  // Get topics based on selected level
  const getTopicsForLevel = () => {
    switch (settings.level) {
      case 'AS Level':
        return AS_TOPICS[settings.subject as keyof typeof AS_TOPICS] || [];
      case 'A Level':
        return A_LEVEL_TOPICS[settings.subject as keyof typeof A_LEVEL_TOPICS] || [];
      default:
        return IGCSE_TOPICS[settings.subject as keyof typeof IGCSE_TOPICS] || [];
    }
  };

  const currentTopics = getTopicsForLevel();
  const allSubjects = Object.keys(IGCSE_TOPICS);

  const handleLevelChange = (level: typeof LEVELS[number]) => {
    setSettings({
      ...settings,
      level,
      topics: [],
      topicQuestions: []
    });
    setRandomQuestions(0);
  };

  const handleSubjectChange = (subject: string) => {
    setSettings({
      ...settings, 
      subject: subject as any,
      topics: [],
      topicQuestions: []
    });
    setRandomQuestions(0);
  };

  const updateTopicQuestionCount = (topic: string, count: number) => {
    const updatedTopicQuestions = [...settings.topicQuestions];
    const existingIndex = updatedTopicQuestions.findIndex(tq => tq.topic === topic);
    
    if (count === 0) {
      if (existingIndex !== -1) {
        updatedTopicQuestions.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex !== -1) {
        updatedTopicQuestions[existingIndex].count = count;
      } else {
        updatedTopicQuestions.push({ topic, count });
      }
    }
    
    setSettings({
      ...settings,
      topicQuestions: updatedTopicQuestions
    });
  };

  const getTopicQuestionCount = (topic: string): number => {
    const topicQuestion = settings.topicQuestions.find(tq => tq.topic === topic);
    return topicQuestion ? topicQuestion.count : 0;
  };

  const totalQuestions = settings.topicQuestions.reduce((sum, tq) => sum + tq.count, 0) + randomQuestions;

  return (
    <div className="min-h-screen bg-black-100 text-white">
      {/* Starry Header */}
      <StarryBackground height="240px" intensity="medium" showMeteors={true}>
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8 text-center">
          <Cover className="inline-block px-8 py-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-sora text-center">
              Question <span className="text-purple-400">Quizzer</span>.
            </h1>
            <p className="text-gray-400 text-center">CamBright Intelligence powered exam practice with authentic past paper questions</p>
          </Cover>
        </div>
      </StarryBackground>
      
      <div className="max-w-6xl mx-auto p-8">
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Level Selection */}
          <div>
            <label className="block text-lg font-medium mb-3">
              <GraduationCap className="w-5 h-5 inline mr-2" />
              Qualification Level:
            </label>
            <div className="grid grid-cols-3 gap-4">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleLevelChange(level)}
                  className={`p-4 border-2 rounded-lg transition-all text-center ${
                    settings.level === level
                      ? 'border-purple-600 bg-purple-900/30'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                >
                  <h3 className={`text-lg font-bold ${settings.level === level ? 'text-purple-400' : 'text-white'}`}>
                    {level}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {level === 'IGCSE' && 'Foundation level (Year 10-11)'}
                    {level === 'AS Level' && 'Advanced Subsidiary (Year 12)'}
                    {level === 'A Level' && 'Advanced Level (Year 13)'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-lg font-medium mb-3">Subject:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {allSubjects.map((subject) => (
                <div
                  key={subject}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    settings.subject === subject
                      ? 'border-purple-600 bg-purple-900/30'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                  onClick={() => handleSubjectChange(subject)}
                >
                  <h3 className={`text-sm font-bold mb-1 ${getSubjectColor(subject)}`}>
                    {subject}
                  </h3>
                  <p className="text-xs text-gray-400 leading-tight">
                    {getSubjectDescription(subject)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Selection with Question Counts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-lg font-medium">Topics & Question Distribution:</label>
              <span className="text-sm text-gray-400">Required - Select topics and question counts</span>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Select topics and specify how many questions you want from each:
                </p>
              </div>
              
              {/* Random Questions Option */}
              <div className="mb-4 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shuffle className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-medium">Random Mixed Topics</span>
                    <span className="text-xs text-purple-400">(All topics combined)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRandomQuestions(Math.max(0, randomQuestions - 1))}
                      className="w-8 h-8 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-mono text-purple-300">{randomQuestions}</span>
                    <button
                      type="button"
                      onClick={() => setRandomQuestions(randomQuestions + 1)}
                      className="w-8 h-8 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* All Topics Grid - Always Visible, Aligned, No Scrollbar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto scrollbar-hide">
                {currentTopics.map((topic) => {
                  const count = getTopicQuestionCount(topic);
                  return (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm flex-1 pr-2">{topic}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateTopicQuestionCount(topic, Math.max(0, count - 1))}
                          className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-sm">{count}</span>
                        <button
                          type="button"
                          onClick={() => updateTopicQuestionCount(topic, count + 1)}
                          className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-300">Total Questions:</span>
                  <span className="font-bold text-purple-300">{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-purple-300">Estimated Time:</span>
                  <span className="font-bold text-purple-300">{Math.ceil(totalQuestions * 1.5)} minutes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Time Limit */}
            <div>
              <label className="block text-lg font-medium mb-3">
                <Clock className="w-5 h-5 inline mr-2" />
                Time Limit (minutes):
              </label>
              <input 
                type="number"
                min="5"
                max="180"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={settings.timeLimit}
                onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value) || 30})}
              />
              <p className="text-xs text-gray-400 mt-1">
                Recommended: {Math.ceil(totalQuestions * 1.5)} minutes
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-lg font-medium mb-3">Difficulty:</label>
              <div className="relative">
                <select 
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={settings.difficulty}
                  onChange={(e) => setSettings({...settings, difficulty: e.target.value})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Mixed">Mixed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Paper Type */}
            <div>
              <label className="block text-lg font-medium mb-3">Paper Type:</label>
              <div className="relative">
                <select 
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={settings.paper}
                  onChange={(e) => setSettings({...settings, paper: e.target.value})}
                >
                  <option value="Mixed (MCQ & Theory)">Mixed (MCQ & Theory)</option>
                  <option value="MCQ Only">MCQ Only</option>
                  <option value="Theory Only">Theory Only</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={totalQuestions === 0}
              className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-700 disabled:cursor-not-allowed px-8 py-4 rounded-lg font-medium text-lg transition-colors"
            >
              <Play className="w-6 h-6" />
              <span>Generate Quiz ({totalQuestions} questions)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}