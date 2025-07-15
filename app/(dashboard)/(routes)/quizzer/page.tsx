// "use client";
// // app/quizzer/page.tsx
// import React, { useState } from "react";
// import Filter from "./_components/Filter";
// import { Button } from "@/components/ui/button";
// import {
//   FcList,
//   FcQuestions,
//   FcReadingEbook,
//   FcTodoList,
// } from "react-icons/fc";
// import FloatingNavbar from "@/components/FloatingNavbar";
// import FloatingMCQNavbar from "@/components/FloatingMCQNavbar";
// import { FloatingDock } from "../predictor/_components/floating-dock";
// import {
//   IconCalculator,
//   IconExchange,
//   IconHome,
//   IconTerminal2,
// } from "@tabler/icons-react";
// import { Banner } from "@/components/bannerimp";

// const Quizzer: React.FC = () => {
//   const [filters, setFilters] = useState({
//     subject: "",
//     year: "All",
//     topic: "All",
//     variant: "All",
//     session: "All",
//     type: "IGCSE Extended",
//     difficulty: "Medium",
//   });
//   const [isDockVisible, setIsDockVisible] = useState(true);

//   const handleFilterChange = (newFilters: any) => {
//     setFilters((prev) => ({ ...prev, ...newFilters }));
//   };

//   const handleGetQuestions = () => {
//     window.open("https://www.google.com", "_blank");
//   };

//   const handleCreateQuiz = () => {
//     window.open("https://www.google.com", "_blank");
//   };
//   const links = [
//     {
//       title: "Main",
//       icon: <IconHome className="h-full w-full text-neutral-300" />,
//       href: "#",
//     },

//     {
//       title: "Predictor",
//       icon: <IconTerminal2 className="h-full w-full text-neutral-300" />,
//       href: "predictor",
//     },
//     {
//       title: "Calculator",
//       icon: <IconCalculator className="h-full w-full text-neutral-300" />,
//       href: "#",
//     },

//     {
//       title: "Generator",
//       icon: <IconExchange className="h-full w-full text-neutral-300" />,
//       href: "quizzer",
//     },
//   ];

//   return (
//     <div className="p-8 text-white">
//       <Banner
//         label="Sorry, Quizzer is not ready, it wont work, coming soon!"
//         variant={"development"}
//       />
//       <h1 className="text-3xl font-bold mb-6 text-center"> Quizzer</h1>
//       <div className="max-w-3xl mx-auto   shadow-md rounded-lg p-6">
//         <Filter
//           subjects={["Biology", "Chemistry", "Physics", "Economics"]}
//           years={["2021", "2022", "2023"]}
//           type={["IGCSE Extended", "IGCSE Core"]}
//           topics={
//             filters.subject === "Biology"
//               ? [
//                   "Characteristics and Classification of Living Organisms",
//                   "Organisation of the Organism",
//                   "Movement into and out of Cells",
//                   "Biological Molecules",
//                   "Enzymes",
//                   "Plant Nutrition",
//                   "Human Nutrition",
//                   "Transport in Plants",
//                   "Transport in Animals",
//                   "Diseases and Immunity",
//                   "Gas Exchange in Humans",
//                   "Respiration",
//                   "Excretion in Humans",
//                   "Coordination and Response",
//                   "Drugs",
//                   "Reproduction",
//                   "Inheritance",
//                   "Variation and Selection",
//                   "Organisms and their Environment",
//                   "Human Influences on Ecosystems",
//                   "Biotechnology and Genetic Modification",
//                 ]
//               : filters.subject === "Science"
//               ? ["Biology", "Physics"]
//               : []
//           }
//           variants={["V1", "V2", "V3", "All"]}
//           sessions={["May/June", "October/November", "Feb/March", "Any"]}
//           onFilterChange={handleFilterChange}
//           selectedSubject={filters.subject}
//         />
//         <div className="mt-10 flex flex-col md:flex-row md:ml-32">
//           <Button
//             className="mb-2 md:mb-0 md:mr-5"
//             onClick={handleGetQuestions}
//             variant="tert"
//           >
//             Get Questions <FcQuestions className="text-lg ml-2" />
//           </Button>
//           <Button onClick={handleCreateQuiz} variant="tert">
//             Create Quiz <FcTodoList className="text-lg ml-2" />
//           </Button>
//         </div>
//       </div>
//       <div className="fixed bottom-4 left-20 right-0 flex items-center justify-center w-full">
//         {/* FloatingDock */}
//         {isDockVisible && (
//           <div className="mb-4 ml-4">
//             {" "}
//             {/* Add margin to dock */}
//             <FloatingDock
//               mobileClassName="translate-x-20" // only for demo, remove for production
//               items={links}
//             />
//           </div>
//         )}
//       </div>
//       <div className="h-24" />
//     </div>
//   );
// };

// export default Quizzer;

"use client";

import React, { useState, useEffect } from "react";
import { QuizSetup } from "@/components/QuizSetup";
import { QuizInterface } from "@/components/QuizInterface";
import { QuizResults } from "@/components/QuizResults";
import {
  Question,
  MCQOption,
  MarkSchemeEntry,
  Paper,
  QuizQuestion,
  QuizSettings,
  UserAnswer,
  SubjectData,
} from "@/types";
import {
  parseQuestions,
  parseMCQOptions,
  parseMarkScheme,
  parsePapers,
} from "@/utils/csvParser";
import { generateQuiz } from "@/utils/quizGenerator";

type AppState = "setup" | "quiz" | "results";

export default function Page() {
  const [appState, setAppState] = useState<AppState>("setup");
  const [subjectData, setSubjectData] = useState<{
    [key: string]: SubjectData;
  }>({});
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [quizResults, setQuizResults] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const subjects = ["Biology", "Chemistry", "Physics"];
        const loadedData: { [key: string]: SubjectData } = {};

        for (const subject of subjects) {
          try {
            let questionsFile, mcqFile, markSchemeFile;

            if (subject === "Biology") {
              questionsFile = "/data/Question (1).csv";
              mcqFile = "/data/MCQOption (1).csv";
              markSchemeFile = "/data/MarkSchemeEntry (1).csv";
            } else {
              questionsFile = `/data/${subject.toLowerCase()}-questions.csv`;
              mcqFile = `/data/${subject.toLowerCase()}-mcq-options.csv`;
              markSchemeFile = `/data/${subject.toLowerCase()}-markscheme.csv`;
            }

            const questionsResponse = await fetch(questionsFile);
            if (!questionsResponse.ok)
              throw new Error(`Failed to load ${subject} questions`);
            const questionsText = await questionsResponse.text();
            const parsedQuestions = parseQuestions(questionsText);

            const mcqResponse = await fetch(mcqFile);
            if (!mcqResponse.ok)
              throw new Error(`Failed to load ${subject} MCQ options`);
            const mcqText = await mcqResponse.text();
            const parsedMCQ = parseMCQOptions(mcqText);

            const markSchemeResponse = await fetch(markSchemeFile);
            if (!markSchemeResponse.ok)
              throw new Error(`Failed to load ${subject} mark scheme`);
            const markSchemeText = await markSchemeResponse.text();
            const parsedMarkScheme = parseMarkScheme(markSchemeText);

            const uniquePaperIds = [
              ...new Set(parsedQuestions.map((q) => q.paperId)),
            ];
            const mockPapers = uniquePaperIds.map((id) => ({
              id,
              year: "2023",
              session: "May/June",
              variant: "1",
              subject: subject,
              paperType: "Theory",
            }));

            loadedData[subject] = {
              questions: parsedQuestions,
              mcqOptions: parsedMCQ,
              markScheme: parsedMarkScheme,
              papers: mockPapers,
            };

            console.log(
              `Loaded ${subject}: ${parsedQuestions.length} questions`
            );
          } catch (subjectError) {
            console.warn(`Failed to load ${subject} data:`, subjectError);
            loadedData[subject] = {
              questions: [],
              mcqOptions: [],
              markScheme: [],
              papers: [],
            };
          }
        }

        setSubjectData(loadedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading CSV data:", error);
        setError("Failed to load quiz data. Please try again.");
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStartQuiz = (settings: QuizSettings) => {
    const data = subjectData[settings.subject];
    if (!data || data.questions.length === 0) {
      setError(`No questions available for ${settings.subject}.`);
      return;
    }

    const quiz = generateQuiz(
      data.questions,
      data.mcqOptions,
      data.markScheme,
      data.papers,
      settings
    );
    if (quiz.length === 0) {
      setError(
        "No questions match your criteria. Please try different settings."
      );
      return;
    }

    setCurrentQuiz(quiz);
    setAppState("quiz");
  };

  const handleQuizComplete = (answers: UserAnswer[]) => {
    setQuizResults(answers);
    setAppState("results");
  };

  const handleRestart = () => {
    setAppState("setup");
    setCurrentQuiz([]);
    setQuizResults([]);
    setError(null);
  };

  const handleBackToSetup = () => {
    setAppState("setup");
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-n-8 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading quiz data...</p>
          <p className="text-sm text-gray-400 mt-2">
            Loading Biology, Chemistry, and Physics questions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-n-8 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (appState === "setup") {
    return (
      <QuizSetup
        onStartQuiz={handleStartQuiz}
        availableSubjects={Object.keys(subjectData)}
      />
    );
  }

  if (appState === "quiz") {
    return (
      <QuizInterface
        questions={currentQuiz}
        onComplete={handleQuizComplete}
        onBack={handleBackToSetup}
      />
    );
  }

  if (appState === "results") {
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
