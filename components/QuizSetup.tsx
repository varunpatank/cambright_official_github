import React, { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { QuizSettings } from "@/types";

interface QuizSetupProps {
  onStartQuiz: (settings: QuizSettings) => void;
  availableSubjects: string[];
}

export function QuizSetup({ onStartQuiz, availableSubjects }: QuizSetupProps) {
  const [settings, setSettings] = useState<QuizSettings>({
    subject: "Biology" as "Biology" | "Chemistry" | "Physics",
    yearRange: { from: "2020", to: "present" },
    topics: [],
    variant: "Any",
    session: "Any",
    boardType: "Extended",
    difficulty: "Medium",
    paper: "Mixed (MCQ & Theory)",
    numberOfQuestions: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz(settings);
  };

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

  const getSubjectDescription = (subject: string) => {
    switch (subject) {
      case "Biology":
        return "Study of living organisms and life processes";
      case "Chemistry":
        return "Study of matter, atoms, and chemical reactions";
      case "Physics":
        return "Study of matter, energy, and their interactions";
      default:
        return "Cambridge IGCSE Science";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-12">Quizzer</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-medium mb-3">Subject:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableSubjects.map((subject) => (
                <div
                  key={subject}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    settings.subject === subject
                      ? "border-purple-600 bg-purple-900/30"
                      : "border-gray-700 bg-gray-900 hover:border-gray-600"
                  }`}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      subject: subject as "Biology" | "Chemistry" | "Physics",
                    })
                  }
                >
                  <div className="text-center">
                    <h3
                      className={`text-xl font-bold mb-2 ${getSubjectColor(
                        subject
                      )}`}
                    >
                      {subject}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {getSubjectDescription(subject)}
                    </p>
                    <div className="mt-3 text-xs text-gray-500">
                      Cambridge IGCSE O Level
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-medium mb-3">
                Number of Questions:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={settings.numberOfQuestions}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    numberOfQuestions: parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-3">
                Difficulty:
              </label>
              <div className="relative">
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600"
                  value={settings.difficulty}
                  onChange={(e) =>
                    setSettings({ ...settings, difficulty: e.target.value })
                  }
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-3">
              Paper Type:
            </label>
            <div className="relative">
              <select
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={settings.paper}
                onChange={(e) =>
                  setSettings({ ...settings, paper: e.target.value })
                }
              >
                <option value="Mixed (MCQ & Theory)">
                  Mixed (MCQ & Theory)
                </option>
                <option value="MCQ Only">MCQ Only</option>
                <option value="Theory Only">Theory Only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
            >
              <Play className="w-6 h-6" />
              <span>Start Quiz</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
