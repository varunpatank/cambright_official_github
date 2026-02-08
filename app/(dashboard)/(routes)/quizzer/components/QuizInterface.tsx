import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { GeneratedQuizQuestion, UserAnswer } from "../types/quiz";

interface QuizInterfaceProps {
  questions: GeneratedQuizQuestion[];
  onComplete: (answers: UserAnswer[]) => void;
  onBack: () => void;
  timeLimit: number; // in minutes
  subject?: string; // Add subject to determine if math formatting should apply
}

// Helper function to render mathematical notation - ONLY for Mathematics subject
const renderMathText = (text: string, isMathSubject: boolean = false) => {
  if (!text) return text;
  
  // Only apply math symbol conversions for Mathematics subject
  if (!isMathSubject) return text;
  
  // Convert some common mathematical expressions for better readability
  return text
    // Make exponents more visible
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^(\d)/g, (match, digit) => {
      const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
      return superscripts[parseInt(digit)] || match;
    })
    // Make fractions more readable  
    .replace(/(\w+)\/(\w+)/g, '$1/$2')
    // Handle some common mathematical symbols
    .replace(/sqrt\(([^)]+)\)/g, '√($1)')
    .replace(/\bpi\b/gi, 'π')
    .replace(/\btheta\b/gi, 'θ')
    .replace(/\balpha\b/gi, 'α')
    .replace(/\bbeta\b/gi, 'β')
    .replace(/\bgamma\b/gi, 'γ')
    .replace(/\bdelta\b/gi, 'δ');
};

export function QuizInterface({
  questions,
  onComplete,
  onBack,
  timeLimit,
  subject = '',
}: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // convert to seconds
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    marksAwarded: number;
    feedback: string;
    keywords?: string[];
  } | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  
  // Only apply math formatting for Mathematics subject
  const isMathSubject = useMemo(() => 
    subject.toLowerCase().includes('math'), 
    [subject]
  );

  // Scroll to top when component mounts or question changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentQuestionIndex]);
  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsTimeUp(true);
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleTimeUp = () => {
    // Auto-submit current answer if any
    if (currentAnswer.trim() && !showFeedback) {
      handleAnswerSubmit();
    }
    
    // Complete quiz with current answers
    setTimeout(() => {
      onComplete(userAnswers);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 60) return "text-red-400"; // Last minute
    if (timeRemaining <= 300) return "text-yellow-400"; // Last 5 minutes
    return "text-white";
  };

  const checkAnswer = (userAnswer: string, question: GeneratedQuizQuestion) => {
    const maxMarks = question.marks;
    
    if (question.questionType === 'MCQ') {
      const isCorrect = userAnswer.toUpperCase() === question.options?.correct;
      return {
        isCorrect,
        marksAwarded: isCorrect ? maxMarks : 0,
        feedback: isCorrect 
          ? 'Correct! Well done.' 
          : `Incorrect. The correct answer is ${question.options?.correct}. ${question.options?.[question.options.correct]}`,
        keywords: isCorrect ? [] : [question.options?.[question.options.correct] || '']
      };
    } else {
      // Enhanced FRQ answer checking with mathematical notation support
      const normalizeAnswer = (answer: string) => {
        return answer
          .toLowerCase()
          .trim()
          // Normalize mathematical expressions
          .replace(/\s+/g, ' ')
          // Handle exponent notation: treat ^ as power
          .replace(/\*\*/g, '^') // Convert ** to ^
          .replace(/\s*\^\s*/g, '^') // Remove spaces around ^
          // Normalize fractions
          .replace(/\s*\/\s*/g, '/')
          // Handle common mathematical terms
          .replace(/power\s+of/g, '^')
          .replace(/to\s+the\s+power\s+of/g, '^')
          .replace(/squared/g, '^2')
          .replace(/cubed/g, '^3');
      };
      
      const normalizedUserAnswer = normalizeAnswer(userAnswer);
      const keywords = question.markScheme.keywords.map(k => normalizeAnswer(k));
      
      let matchedKeywords = 0;
      const matchedTerms: string[] = [];
      
      keywords.forEach(keyword => {
        if (keyword && (
          normalizedUserAnswer.includes(keyword) ||
          // Check for mathematical equivalents
          (keyword.includes('^') && normalizedUserAnswer.includes(keyword)) ||
          // Check for alternative expressions
          normalizedUserAnswer.replace(/\s/g, '').includes(keyword.replace(/\s/g, ''))
        )) {
          matchedKeywords++;
          matchedTerms.push(keyword);
        }
      });
      
      const marksAwarded = Math.min(Math.round((matchedKeywords / keywords.length) * maxMarks), maxMarks);
      const isCorrect = marksAwarded >= maxMarks * 0.7;
      
      return {
        isCorrect,
        marksAwarded,
        feedback: isCorrect 
          ? `Excellent answer! You included key terms: ${matchedTerms.join(', ')}`
          : `Partial credit awarded (${marksAwarded}/${maxMarks}). ${question.markScheme.guidance}`,
        keywords: keywords
      };
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const result = checkAnswer(currentAnswer, currentQuestion);
    setFeedback(result);
    setShowFeedback(true);

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      isCorrect: result.isCorrect,
      marksAwarded: result.marksAwarded,
      keywords: result.keywords,
    };

    setUserAnswers((prev) => [...prev, userAnswer]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentAnswer("");
      setShowFeedback(false);
      setFeedback(null);
    } else {
      onComplete(userAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setCurrentAnswer("");
      setShowFeedback(false);
      setFeedback(null);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (isTimeUp) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Time&apos;s Up!</h2>
          <p className="text-gray-400 mb-6">Your quiz has been automatically submitted.</p>
          <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Modern Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/90 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-base font-medium">Back</span>
            </button>

            <div className="flex items-center gap-8">
              {/* Timer */}
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 ${getTimeColor()}`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg font-mono font-bold tracking-wider">{formatTime(timeRemaining)}</span>
              </div>
              
              {/* Question Counter */}
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-2xl font-bold text-white">{currentQuestionIndex + 1}</span>
                <span className="text-gray-500 text-lg">/</span>
                <span className="text-gray-400 text-lg">{questions.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-900">
          <div
            className="h-full bg-gradient-to-r from-purple-700 via-purple-500 to-purple-600 transition-all duration-500 ease-out relative"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-purple-500/50" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Question Card */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-purple-600/10 rounded-2xl blur-xl" />
          
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            {/* Question Header */}
            <div className="px-8 py-5 border-b border-white/5 bg-purple-900/10">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 uppercase">Q</span>
                    <span className="text-3xl font-bold text-white">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300">
                      <FileText className="w-3.5 h-3.5" />
                      IGCSE
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-300">
                      {currentQuestion.topic}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm font-medium text-yellow-300">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>
                
                {/* Marks Badge */}
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-green-600/10 border border-green-500/20">
                  <span className="text-sm font-medium text-green-400/80">Marks:</span>
                  <span className="text-xl font-bold text-green-400">{currentQuestion.marks}</span>
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="px-8 py-6">
              <p className="text-xl leading-relaxed text-gray-100">
                {renderMathText(currentQuestion.questionText, isMathSubject)}
              </p>
            </div>

            {/* Answer Options */}
            <div className="px-8 pb-6">
              {currentQuestion.questionType === "MCQ" && currentQuestion.options ? (
                <div className="space-y-4">
                  <span className="text-sm font-medium text-gray-500 uppercase">Select your answer</span>
                  <div className="grid gap-3 mt-3">
                    {Object.entries(currentQuestion.options).filter(([key]) => key !== 'correct').map(([key, value]) => {
                      const isSelected = currentAnswer === key;
                      return (
                        <label
                          key={key}
                          className={`group relative flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-300 border ${
                            isSelected 
                              ? 'bg-purple-600/20 border-purple-500/50' 
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                          } ${showFeedback ? 'pointer-events-none' : ''}`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                            isSelected 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                          }`}>
                            {key}
                          </div>
                          <span className={`text-base leading-relaxed transition-colors duration-300 ${
                            isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {renderMathText(value, isMathSubject)}
                          </span>
                          <input
                            type="radio"
                            name="mcq-answer"
                            value={key}
                            checked={isSelected}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className="sr-only"
                            disabled={showFeedback}
                          />
                          {isSelected && (
                            <div className="absolute right-5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-500 uppercase">
                    Your Answer
                  </label>
                  <textarea
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 text-white text-base leading-relaxed placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-300"
                    rows={5}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here... (Use ^ for exponents, e.g., x²)"
                    disabled={showFeedback}
                  />
                </div>
              )}
            </div>

            {/* Your Answer Display */}
            {showFeedback && currentAnswer && (
              <div className="mx-8 mb-5 p-5 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
                  Your Answer
                </h4>
                {currentQuestion.questionType === "MCQ" ? (
                  <p className="text-white text-base">
                    <span className="font-bold text-purple-400">{currentAnswer}.</span>{" "}
                    {currentQuestion.options?.[currentAnswer as keyof typeof currentQuestion.options] || "Selected option"}
                  </p>
                ) : (
                  <p className="text-white text-base leading-relaxed">{currentAnswer}</p>
                )}
              </div>
            )}

            {/* Feedback Section */}
            {showFeedback && feedback && (
              <div className="mx-8 mb-6">
                <div
                  className={`p-5 rounded-xl border ${
                    feedback.isCorrect
                      ? "bg-green-900/20 border-green-500/30"
                      : "bg-red-900/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {feedback.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <span className={`text-lg font-semibold ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {feedback.isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                    <span className="text-base text-gray-400">
                      {feedback.marksAwarded}/{currentQuestion.marks} marks
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-base leading-relaxed mb-4">{feedback.feedback}</p>

                  {feedback.keywords && feedback.keywords.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
                        Key terms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {feedback.keywords.slice(0, 5).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-medium text-base transition-all duration-300 border border-white/5 hover:border-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <div className="flex gap-4">
                  {!showFeedback && (
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!currentAnswer.trim()}
                      className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-semibold text-base transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none"
                    >
                      Submit Answer
                    </button>
                  )}

                  {showFeedback && (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                    >
                      <span>
                        {isLastQuestion ? "Finish Quiz" : "Next Question"}
                      </span>
                      {!isLastQuestion && <ChevronRight className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question Navigator Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {questions.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentQuestionIndex 
                  ? 'w-8 bg-purple-500' 
                  : idx < currentQuestionIndex 
                    ? 'w-2 bg-purple-500/50' 
                    : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}