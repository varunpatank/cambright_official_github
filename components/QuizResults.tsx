import React from "react";
import { Trophy, RotateCcw, Home, CheckCircle, XCircle } from "lucide-react";
import { UserAnswer, QuizQuestion } from "@/types";

interface QuizResultsProps {
  answers: UserAnswer[];
  questions: QuizQuestion[];
  onRestart: () => void;
  onHome: () => void;
}

export function QuizResults({
  answers,
  questions,
  onRestart,
  onHome,
}: QuizResultsProps) {
  const totalMarks = answers.reduce(
    (sum, answer) => sum + answer.marksAwarded,
    0
  );
  const maxMarks = questions.reduce(
    (sum, q) => sum + parseInt(q.question.marks || "1"),
    0
  );
  const percentage = Math.round((totalMarks / maxMarks) * 100);
  const correctAnswers = answers.filter((a) => a.isCorrect).length;

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A*", color: "text-purple-400" };
    if (percentage >= 80) return { grade: "A", color: "text-purple-400" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-400" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-400" };
    if (percentage >= 50) return { grade: "D", color: "text-orange-400" };
    return { grade: "F", color: "text-red-400" };
  };

  const gradeInfo = getGrade(percentage);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Quizzer</h1>
        <button
          onClick={onHome}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
          <p className="text-xl text-gray-400">Here are your results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {percentage}%
            </div>
            <div className="text-gray-400">Overall Score</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </div>
            <div className="text-gray-400">Grade</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {totalMarks}/{maxMarks}
            </div>
            <div className="text-gray-400">Marks</div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Question Breakdown</h2>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              return (
                <div
                  key={question.question.id}
                  className="flex items-start justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    {userAnswer.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="font-medium">Question {index + 1}</div>
                        {question.paper && (
                          <div className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {question.paper.year} Paper {question.paper.variant}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        {question.question.questionText.length > 100
                          ? question.question.questionText.substring(0, 100) +
                            "..."
                          : question.question.questionText}
                      </div>
                      <div className="text-sm text-gray-300 mb-2">
                        <strong>Your answer:</strong>{" "}
                        {userAnswer.answer || "No answer provided"}
                      </div>
                      {userAnswer.keywords &&
                        userAnswer.keywords.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Key terms:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {userAnswer.keywords
                                .slice(0, 5)
                                .map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-purple-900 text-purple-300 px-2 py-1 rounded text-xs"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-medium">
                      {userAnswer.marksAwarded}/{question.question.marks || "1"}
                    </div>
                    <div className="text-sm text-gray-400">marks</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {correctAnswers}
              </div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {questions.length - correctAnswers}
              </div>
              <div className="text-sm text-gray-400">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {questions.length}
              </div>
              <div className="text-sm text-gray-400">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round((correctAnswers / questions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onRestart}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Take Another Quiz</span>
          </button>
          <button
            onClick={onHome}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
