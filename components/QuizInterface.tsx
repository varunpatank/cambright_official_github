import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { QuizQuestion, UserAnswer } from "@/types";
import { checkAnswer } from "../utils/quizGenerator";

interface QuizInterfaceProps {
  questions: QuizQuestion[];
  onComplete: (answers: UserAnswer[]) => void;
  onBack: () => void;
}

export function QuizInterface({
  questions,
  onComplete,
  onBack,
}: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    marksAwarded: number;
    feedback: string;
    keywords?: string[];
  } | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const result = checkAnswer(currentAnswer, currentQuestion);
    setFeedback(result);
    setShowFeedback(true);

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.question.id,
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

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "Biology":
        return "text-green-400";
      case "Chemistry":
        return "text-blue-400";
      case "Physics":
        return "text-orange-400";
      default:
        return "text-purple-400";
    }
  };

  return (
    <div className="min-h-screen bg-n-8 text-white">
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Setup</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-mono">{formatTime(timeElapsed)}</span>
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
        <div className="bg-n-7 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>IGCSE O Level</span>
                </div>
                <div
                  className={getSubjectColor(
                    currentQuestion.paper?.subject || "Biology"
                  )}
                >
                  {currentQuestion.paper?.subject || "Biology"}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-n-6 px-3 py-1 rounded-lg">
              <span className="text-sm">Marks:</span>
              <span className="font-bold">
                {currentQuestion.question.marks || "1"}
              </span>
            </div>
          </div>

          <p className="text-lg leading-relaxed mb-8">
            {currentQuestion.question.questionText}
          </p>

          {(currentQuestion.question.questionText
            .toLowerCase()
            .includes("diagram") ||
            currentQuestion.question.questionText
              .toLowerCase()
              .includes("graph") ||
            currentQuestion.question.questionText
              .toLowerCase()
              .includes("chart")) && (
            <div className="bg-purple-900/30 border border-purple-600/50 rounded-lg p-4 mb-6">
              <p className="text-purple-300 text-sm">
                📊 This question contains a diagram. Please search up the
                question online to view the diagram.
              </p>
            </div>
          )}

          {currentQuestion.question.questionType === "MCQ" &&
          currentQuestion.options &&
          currentQuestion.options.length > 0 ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="mcq-answer"
                    value={option.optionLetter}
                    checked={currentAnswer === option.optionLetter}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-600"
                    disabled={showFeedback}
                  />
                  <span className="font-medium">{option.optionLetter}.</span>
                  <span>{option.optionText}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Answer:
              </label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
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
              {currentQuestion.question.questionType === "MCQ" ? (
                <p className="text-white">
                  {currentAnswer}.{" "}
                  {currentQuestion.options?.find(
                    (opt) => opt.optionLetter === currentAnswer
                  )?.optionText || "Selected option"}
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
                  ({feedback.marksAwarded}/
                  {currentQuestion.question.marks || "1"} marks)
                </span>
              </div>
              <p className="text-sm mb-3">{feedback.feedback}</p>

              {feedback.keywords && feedback.keywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Key terms needed:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.keywords.map((keyword, index) => (
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
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Submit Answer
                </button>
              )}

              {showFeedback && (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
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
