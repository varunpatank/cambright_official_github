import React, { useState, useEffect } from "react";
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
}

export function QuizInterface({
  questions,
  onComplete,
  onBack,
  timeLimit,
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
      // FRQ answer checking
      const userAnswerLower = userAnswer.toLowerCase();
      const keywords = question.markScheme.keywords.map(k => k.toLowerCase());
      
      let matchedKeywords = 0;
      const matchedTerms: string[] = [];
      
      keywords.forEach(keyword => {
        if (keyword && userAnswerLower.includes(keyword)) {
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
          <h2 className="text-3xl font-bold mb-4">Time's Up!</h2>
          <p className="text-gray-400 mb-6">Your quiz has been automatically submitted.</p>
          <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Setup</span>
        </button>

        <div className="flex items-center space-x-6">
          <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
            <Clock className="w-5 h-5" />
            <span className="text-lg font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
          <div className="text-lg">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-900 h-2">
        <div
          className="bg-purple-600 h-2 transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-900 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>IGCSE</span>
                </div>
                <div className="text-purple-400">
                  {currentQuestion.topic}
                </div>
                <div className="text-yellow-400">
                  {currentQuestion.difficulty}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-800 px-3 py-1 rounded-lg text-white">
              <span className="text-sm">Marks:</span>
              <span className="font-bold">{currentQuestion.marks}</span>
            </div>
          </div>

          <p className="text-lg leading-relaxed mb-8">
            {currentQuestion.questionText}
          </p>

          {currentQuestion.questionType === "MCQ" && currentQuestion.options ? (
            <div className="space-y-3 mt-4">
              {Object.entries(currentQuestion.options).filter(([key]) => key !== 'correct').map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="mcq-answer"
                    value={key}
                    checked={currentAnswer === key}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-600"
                    disabled={showFeedback}
                  />
                  <span className="font-medium">{key}.</span>
                  <span>{value}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Answer:
              </label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none mt-2"
                rows={4}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={showFeedback}
              />
            </div>
          )}

          {showFeedback && currentAnswer && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-medium text-sm text-gray-300 mb-2">
                Your Answer:
              </h4>
              {currentQuestion.questionType === "MCQ" ? (
                <p className="text-white">
                  {currentAnswer}.{" "}
                  {currentQuestion.options?.[currentAnswer as keyof typeof currentQuestion.options] || "Selected option"}
                </p>
              ) : (
                <p className="text-white">{currentAnswer}</p>
              )}
            </div>
          )}

          {showFeedback && feedback && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                feedback.isCorrect
                  ? "bg-green-900 border border-green-700"
                  : "bg-red-900 border border-red-700"
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {feedback.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium">
                  {feedback.isCorrect ? "Correct!" : "Incorrect"}
                </span>
                <span className="text-sm">
                  ({feedback.marksAwarded}/{currentQuestion.marks} marks)
                </span>
              </div>
              <p className="text-sm mb-3">{feedback.feedback}</p>

              {feedback.keywords && feedback.keywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Key terms needed:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.keywords.slice(0, 5).map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-purple-300 px-2 py-1 rounded text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-4">
              {!showFeedback && (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!currentAnswer.trim()}
                  className="px-6 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Submit Answer
                </button>
              )}

              {showFeedback && (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg font-medium transition-colors"
                >
                  <span>
                    {isLastQuestion ? "Finish Quiz" : "Next Question"}
                  </span>
                  {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}