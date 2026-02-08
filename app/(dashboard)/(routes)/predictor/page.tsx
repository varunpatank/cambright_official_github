"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React from "react";
import {
  FcCalculator,
  FcCurrencyExchange,
  FcLandscape,
  FcCommandLine,
  FcPanorama,
  FcCollaboration,
  FcGlobe,
  FcBiotech,
  FcBiomass,
  FcBusiness,
  FcBiohazard,
  FcFilmReel,
  FcSimCard,
  FcBarChart,
  FcConferenceCall,
  FcFilm,
  FcMusic,
  FcSportsMode,
  FcReading,
  FcElectricalSensor,
  FcMultipleSmartphones,
} from "react-icons/fc";
import { IoLanguageSharp, IoFastFood } from "react-icons/io5";
import { SiEnterprisedb } from "react-icons/si";
import { FaMosque, FaFishFins } from "react-icons/fa6";
import { IconType } from "react-icons/lib";
import { FaFlagUsa } from "react-icons/fa";
import PrintButton from "./_components/printBtn";
import {
  PlusCircle,
  X,
} from "lucide-react";
import { Cover } from "@/components/ui/cover";
import { StarryBackground } from "@/components/ui/starry-background";
import { Subject } from "@prisma/client";
import SubjectIcon from "../tutor/courses/_components/subject-icon";
import { calculateGradeFromAveragedThresholds } from "./_components/thresholdData";

const iconMap: Record<Subject["name"], IconType> = {
  "Accounting": FcCurrencyExchange,
  "Agriculture": FcLandscape,
  "ASL": IoLanguageSharp,
  "Arabic": FcCollaboration,
  "AFL": IoLanguageSharp,
  "Art & Design": FcPanorama,
  "Bahasa": IoLanguageSharp,
  "Biology": FcBiotech,
  "Business": FcBusiness,
  "Chemistry": FcBiomass,
  "Chinese CSL": IoLanguageSharp,
  "Chinese Mandarin": FcCollaboration,
  "Computer Science": FcCommandLine,
  "Co-ordinated Double Science": FcBiomass,
  "Combined Science": FcBiohazard,
  "Design & Tech": FcMultipleSmartphones,
  "Drama": FcFilmReel,
  "Economics": FcBarChart,
  "Enterprise": SiEnterprisedb,
  "English - EFL": IoLanguageSharp,
  "English Literature": FcReading,
  "ESL": FcCollaboration,
  "Environmental Management": FcLandscape,
  "Food & Nutrition": IoFastFood,
  "French - FFL": FcCollaboration,
  "Geography": FcGlobe,
  "German - GFL": IoLanguageSharp,
  "Global Perspectives": FcCollaboration,
  "Hindi - HFL": IoLanguageSharp,
  "Hindi - HSL": IoLanguageSharp,
  "History": FcFilm,
  "History - USA": FaFlagUsa,
  "IsiZulu - ISL": IoLanguageSharp,
  "Islmaiyat": FaMosque,
  "Italian - IFL": IoLanguageSharp,
  "Latin": IoLanguageSharp,
  "Malay": IoLanguageSharp,
  "Marine Sciences": FaFishFins,
  "Mathematics": FcCalculator,
  "Add Maths": FcCalculator,
  "International Maths": FcCalculator,
  "Music": FcMusic,
  "P.E": FcSportsMode,
  "Pakistan studies": FcReading,
  "Portuguese - PFL": IoLanguageSharp,
  "Religious Studies": FaMosque,
  "Sanskrit": IoLanguageSharp,
  "Setswana": IoLanguageSharp,
  "Sociology": FcConferenceCall,
  "Spanish": IoLanguageSharp,
  "Spanish Literature": FcReading,
  "Swahili": IoLanguageSharp,
  "Thai": IoLanguageSharp,
  "Turkish": IoLanguageSharp,
  "Urdu": IoLanguageSharp,
  "Vietnamese": IoLanguageSharp,
  "Travel & Tourism": FcGlobe,
  "World Literature": FcReading,
  "Physics": FcElectricalSensor,
  "ICT": FcSimCard,
};

const subjectsList = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Biology" },
  { id: 3, name: "Chemistry" },
  { id: 4, name: "Physics" },
];

const sessionOptions = [
  { id: 1, name: "Feb/March" },
  { id: 2, name: "May/June" },
  { id: 3, name: "Oct/Nov" },
];

const extendedCoreOptions = [
  { id: "Core", name: "Core" },
  { id: "Extended", name: "Extended" },
];

const variantsOptions = [
  { id: "v1", name: "V1" },
  { id: "v2", name: "V2" },
  { id: "v3", name: "V3" },
];

const gradingOptions = [
  { id: "9-1", name: "9-1" },
  { id: "A*-G", name: "A*-G" },
];

type PaperType = "Core" | "Extended";

interface PaperInfo {
  default: number;
  code: string;
  papers: string[];
}

interface PaperInputs {
  [key: string]: {
    Core: PaperInfo;
    Extended: PaperInfo;
  };
}

const paperInputs: PaperInputs = {
  mathematics: {
    Core: {
      default: 60,
      code: "0980",
      papers: ["Paper 1", "Paper 3"],
    },
    Extended: {
      default: 60,
      code: "0980",
      papers: ["Paper 2", "Paper 4"],
    },
  },
  chemistry: {
    Core: {
      default: 60,
      code: "0971",
      papers: ["Paper 1", "Paper 3", "Paper 5"],
    },
    Extended: {
      default: 60,
      code: "0971",
      papers: ["Paper 2", "Paper 4", "Paper 6"],
    },
  },
  physics: {
    Core: {
      default: 60,
      code: "0975",
      papers: ["Paper 1", "Paper 3", "Paper 5"],
    },
    Extended: {
      default: 60,
      code: "0975",
      papers: ["Paper 2", "Paper 4", "Paper 6"],
    },
  },
  biology: {
    Core: {
      default: 60,
      code: "0970",
      papers: ["Paper 1", "Paper 3", "Paper 5"],
    },
    Extended: {
      default: 60,
      code: "0970",
      papers: ["Paper 2", "Paper 4", "Paper 6"],
    },
  },
};

const gradingsystemwithcode = (
  gradingsystem: string | undefined,
  code: string
) => {
  if (gradingsystem === "9-1") {
    return code;
  }
  if (gradingsystem === "A*-G") {
    if (code === "0980") {
      return "0580";
    }
    if (code === "0970") {
      return "0610";
    }
    if (code === "0971") {
      return "0620";
    }
    if (code === "0975") {
      return "0625";
    }
  }
  return code;
};

interface SubjectInfo {
  extendedCore: PaperType | null;
  session: string | null;
  papers: string[];
  marks: Record<string, string>;
  variant: string;
  code: string;
  defaultMark?: number;
  gradingSystem?: string;
}

const sessionmap = {
  "May/June": "June",
  "Feb/March": "March",
  "Oct/Nov": "October",
};

const PredictorPage = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<Record<number, SubjectInfo>>({});
  const [session, setSession] = useState<string | null>(null);
  const [variant, setVariant] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<number, { grade: string; totalMarks: number }>>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addSubject = (subjectId: number) => {
    const subject = subjectsList.find((subj) => subj.id === subjectId);
    if (subject && !selectedSubjects.includes(subjectId)) {
      const subjectKey = subject.name.toLowerCase();
      const subjectPapers = paperInputs[subjectKey as keyof typeof paperInputs];

      if (subjectPapers) {
        setSelectedSubjects([...selectedSubjects, subjectId]);
        setSubjectInfo({
          ...subjectInfo,
          [subjectId]: {
            extendedCore: null,
            session: session,
            papers: [],
            marks: {},
            variant: variant || "v1",
            gradingSystem: "9-1",
            code: subjectPapers.Core.code,
          },
        });
      }
    }
  };

  const removeSubject = (subjectId: number) => {
    setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    const updatedSubjectInfo = { ...subjectInfo };
    delete updatedSubjectInfo[subjectId];
    setSubjectInfo(updatedSubjectInfo);
    
    const updatedPredictions = { ...predictions };
    delete updatedPredictions[subjectId];
    setPredictions(updatedPredictions);
  };

  const handleExtendedCoreChange = (subjectId: number, value: string) => {
    const subjectName = subjectsList
      .find((subj) => subj.id === subjectId)
      ?.name?.toLowerCase();
    if (subjectName && paperInputs[subjectName]) {
      const paperData = paperInputs[subjectName][value as PaperType];
      setSubjectInfo((prevSubjectInfo) => ({
        ...prevSubjectInfo,
        [subjectId]: {
          ...prevSubjectInfo[subjectId],
          extendedCore: value as PaperType,
          papers: paperData.papers,
          defaultMark: paperData.default,
          code: paperData.code,
        },
      }));
    }
  };

  const getMaxMarks = (subjectId: number, paper: string) => {
    const subject = subjectsList.find((subj) => subj.id === subjectId)?.name;
    if (subject === "Mathematics") {
      if (paper === "Paper 2") return 70;
      if (paper === "Paper 4") return 130;
      if (paper === "Paper 1") return 50;
      if (paper === "Paper 3") return 150;
    }
    if (subject === "Chemistry" || subject === "Physics" || subject === "Biology") {
      if (paper === "Paper 2") return 40;
      if (paper === "Paper 4") return 80;
      if (paper === "Paper 6") return 40;
      if (paper === "Paper 1") return 30;
      if (paper === "Paper 3") return 60;
      if (paper === "Paper 5") return 40;
    }
    return 0;
  };

  const handleMarkChange = (subjectId: number, paper: string, value: string) => {
    setSubjectInfo({
      ...subjectInfo,
      [subjectId]: {
        ...subjectInfo[subjectId],
        marks: { ...subjectInfo[subjectId].marks, [paper]: value },
      },
    });
  };

  const handleGradingSystemChange = (subjectId: number, value: string) => {
    setSubjectInfo({
      ...subjectInfo,
      [subjectId]: { ...subjectInfo[subjectId], gradingSystem: value },
    });
  };

  const calculateGrade = (subjectId: number) => {
    const marks = subjectInfo[subjectId]?.marks || {};
    const subjectDetail = subjectInfo[subjectId];
    
    if (!subjectDetail) return { grade: "U", totalMarks: 0 };
    
    const totalMarks = Object.values(marks).reduce<number>(
      (acc, mark) => acc + (Number(mark) || 0),
      0
    );

    if (totalMarks === 0) return { grade: "U", totalMarks: 0 };
    
    const subject = subjectsList.find((subj) => subj.id === subjectId);
    if (!subject || !session || !variant || !subjectDetail.extendedCore) {
      return { grade: "U", totalMarks };
    }
    
    const code = gradingsystemwithcode(subjectDetail.gradingSystem, subjectDetail.code);
    
    const grade = calculateGradeFromAveragedThresholds(
      subject.name,
      code,
      subjectDetail.extendedCore,
      session,
      variant,
      totalMarks,
      subjectDetail.gradingSystem || "9-1"
    );

    return { grade, totalMarks };
  };

  const handlePredict = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPredictions: Record<number, { grade: string; totalMarks: number }> = {};
    
    selectedSubjects.forEach((subjectId) => {
      const result = calculateGrade(subjectId);
      newPredictions[subjectId] = result;
    });
    
    setPredictions(newPredictions);
    setShowResults(true);
    setIsLoading(false);
  };

  const canPredict = () => {
    return selectedSubjects.length > 0 && 
           session && 
           variant &&
           selectedSubjects.every(subjectId => {
             const subjectDetail = subjectInfo[subjectId];
             return subjectDetail?.extendedCore && 
                    Object.keys(subjectDetail.marks).length > 0 &&
                    Object.values(subjectDetail.marks).some(mark => Number(mark) > 0);
           });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Starry Header */}
      <StarryBackground height="280px" intensity="medium" showMeteors={true}>
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            CamBright Intelligence
          </div>
          <Cover className="inline-block px-8 py-6">
            <h1 className="text-5xl md:text-6xl font-sora font-bold text-white mb-3 text-center">
              Grade <span className="text-purple-400">Predictor</span>.
            </h1>
            <p className="text-lg text-gray-400 mb-2 text-center">
              Most Reliable IGCSE Predictor - Based on 10-Year Averaged Cambridge Thresholds
            </p>
            <p className="text-sm text-gray-500 text-center">
              Threshold data averaged from 2015-2024 Cambridge grade boundaries
            </p>
          </Cover>
        </div>
      </StarryBackground>
      
      <div className="relative z-10 p-6 mx-auto max-w-7xl">

        {/* Configuration Panel */}
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-sora font-medium text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Exam Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Session Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Exam Session</label>
              <Select onValueChange={(value) => setSession(value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                  {session || "Select Session"}
                </SelectTrigger>
                <SelectContent>
                  {sessionOptions.map((option) => (
                    <SelectItem key={option.id} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variant Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Paper Variant</label>
              <Select onValueChange={(value) => setVariant(value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                  {variant || "Select Variant"}
                </SelectTrigger>
                <SelectContent>
                  {variantsOptions
                    .filter(option => session !== "Feb/March" || option.name === "V2")
                    .map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Subject */}
          {session && variant && (
            <div className="flex items-center gap-4 flex-wrap">
              <Select onValueChange={(value) => addSubject(Number(value))}>
                <SelectTrigger className="bg-purple-600 hover:bg-purple-500 text-white border-0 w-48 transition-colors">
                  <PlusCircle className="mr-2 w-4 h-4" />
                  Add Subject
                </SelectTrigger>
                <SelectContent>
                  {subjectsList
                    .filter(subject => !selectedSubjects.includes(subject.id))
                    .map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Selected Subjects Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subjectId) => {
                  const subject = subjectsList.find(subj => subj.id === subjectId);
                  return subject ? (
                    <div key={subject.id} className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <SubjectIcon icon={iconMap[subject.name]} />
                      <span className="text-white text-sm">{subject.name}</span>
                      <button
                        onClick={() => removeSubject(subject.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Subject Configuration */}
        {selectedSubjects.length > 0 && (
          <div className="space-y-4 mb-6">
            {selectedSubjects.map((subjectId) => {
              const subject = subjectsList.find(subj => subj.id === subjectId);
              const subjectDetail = subjectInfo[subjectId] || {};
              
              return (
                <div key={subjectId} className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-purple-500/20">
                      <SubjectIcon icon={iconMap[subject?.name || "Mathematics"]} />
                    </div>
                    <div>
                      <h3 className="text-lg font-sora font-medium text-white">{subject?.name}</h3>
                      <span className="text-sm text-gray-500">
                        Code: {gradingsystemwithcode(subjectDetail.gradingSystem, subjectDetail.code)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Level Selection */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Level</label>
                      <Select onValueChange={(value) => handleExtendedCoreChange(subjectId, value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          {subjectDetail.extendedCore || "Select Level"}
                        </SelectTrigger>
                        <SelectContent>
                          {extendedCoreOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Grading System */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Grading System</label>
                      <Select onValueChange={(value) => handleGradingSystemChange(subjectId, value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          {subjectDetail.gradingSystem || "9-1"}
                        </SelectTrigger>
                        <SelectContent>
                          {gradingOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Paper Marks Input */}
                  {subjectDetail.papers && subjectDetail.papers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Paper Marks</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjectDetail.papers.map((paper) => (
                          <div key={paper} className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <label className="block text-sm text-gray-300 mb-2">
                              {paper}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={getMaxMarks(subjectId, paper)}
                                onChange={(e) => handleMarkChange(subjectId, paper, e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white w-20 text-center focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                placeholder="0"
                              />
                              <span className="text-gray-500">/ {getMaxMarks(subjectId, paper)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Predict Button */}
        {selectedSubjects.length > 0 && (
          <div className="text-center mb-6">
            <Button
              onClick={handlePredict}
              disabled={!canPredict() || isLoading}
              className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 text-lg font-sora font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Calculating...
                </div>
              ) : (
                "Predict My Grades"
              )}
            </Button>
          </div>
        )}

        {/* Results Section */}
        {showResults && Object.keys(predictions).length > 0 && (
          <div className="space-y-6">
            {/* Results Card */}
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-sora font-bold text-white">
                    Predicted Results
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {session && sessionmap[session as keyof typeof sessionmap]} Session • {variant}
                  </p>
                </div>
                <div className="no-print">
                  <PrintButton />
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid gap-4">
                {selectedSubjects.map((subjectId) => {
                  const subject = subjectsList.find(subj => subj.id === subjectId);
                  const subjectDetail = subjectInfo[subjectId] || {};
                  const prediction = predictions[subjectId] || { grade: "U", totalMarks: 0 };
                  
                  // Calculate max possible marks for percentage
                  const maxMarks = subjectDetail.papers?.reduce((total, paper) => total + getMaxMarks(subjectId, paper), 0) || 0;
                  const percentage = maxMarks > 0 ? Math.round((prediction.totalMarks / maxMarks) * 100) : 0;
                  
                  return (
                    <div key={subjectId} className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-purple-500/20">
                            <SubjectIcon icon={iconMap[subject?.name || "Mathematics"]} />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-lg">{subject?.name}</div>
                            <div className="text-sm text-gray-400">
                              {subjectDetail.extendedCore} • {gradingsystemwithcode(subjectDetail.gradingSystem, subjectDetail.code)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Score</div>
                            <div className="text-xl font-bold text-white">{prediction.totalMarks}<span className="text-gray-500 text-sm">/{maxMarks}</span></div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Percentage</div>
                            <div className="text-xl font-bold text-purple-400">{percentage}%</div>
                          </div>
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-3xl font-bold text-white">{prediction.grade}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intelligence Overview Section */}
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/20 mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-sora font-bold text-white mb-2">Intelligence Overview</h3>
                <p className="text-gray-400">Understanding your predicted grades</p>
              </div>

              {/* Stacked Subject Cards */}
              <div className="space-y-4 max-w-4xl mx-auto">
                {selectedSubjects.map((subjectId) => {
                  const subject = subjectsList.find(subj => subj.id === subjectId);
                  const subjectDetail = subjectInfo[subjectId] || {};
                  const prediction = predictions[subjectId] || { grade: "U", totalMarks: 0 };
                  
                  const maxMarks = subjectDetail.papers?.reduce((total, paper) => total + getMaxMarks(subjectId, paper), 0) || 0;
                  const percentage = maxMarks > 0 ? Math.round((prediction.totalMarks / maxMarks) * 100) : 0;
                  
                  // Generate insights based on performance
                  const getStrengthLevel = () => {
                    if (percentage >= 85) return { level: "Excellent", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", desc: "Outstanding performance" };
                    if (percentage >= 70) return { level: "Strong", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", desc: "Above average performance" };
                    if (percentage >= 55) return { level: "Good", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", desc: "Solid understanding shown" };
                    if (percentage >= 40) return { level: "Fair", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", desc: "Room for improvement" };
                    return { level: "Needs Work", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", desc: "Focus on fundamentals" };
                  };
                  
                  const strength = getStrengthLevel();
                  
                  // Calculate potential grade if improved
                  const getPotentialImprovement = () => {
                    const gradeOrder = subjectDetail.gradingSystem === "9-1" 
                      ? ["U", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
                      : ["U", "G", "F", "E", "D", "C", "B", "A", "A*"];
                    const currentIndex = gradeOrder.indexOf(prediction.grade);
                    if (currentIndex < gradeOrder.length - 1 && currentIndex >= 0) {
                      const nextGrade = gradeOrder[currentIndex + 1];
                      const pointsNeeded = Math.ceil(maxMarks * 0.08); // Approximate 8% more marks needed
                      return { nextGrade, pointsNeeded };
                    }
                    return null;
                  };
                  
                  const improvement = getPotentialImprovement();
                  
                  return (
                    <div key={subjectId} className={`rounded-2xl p-6 border ${strength.border} ${strength.bg}`}>
                      {/* Subject Header with Grade */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-white/10">
                            <SubjectIcon icon={iconMap[subject?.name || "Mathematics"]} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{subject?.name}</h4>
                            <p className="text-sm text-gray-400">{subjectDetail.extendedCore} • {gradingsystemwithcode(subjectDetail.gradingSystem, subjectDetail.code)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-2 rounded-xl ${strength.bg} border ${strength.border}`}>
                            <span className={`text-sm font-bold ${strength.color}`}>{strength.level}</span>
                          </div>
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">{prediction.grade}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-5">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Score: {prediction.totalMarks}/{maxMarks}</span>
                          <span className={`font-bold ${strength.color}`}>{percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Insights */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-sm text-gray-300 leading-relaxed">
                            <span className="text-purple-400 font-medium">Analysis:</span> {strength.desc} in {subjectDetail.extendedCore?.toLowerCase()} tier. Your score places you at grade <span className="text-white font-bold">{prediction.grade}</span> based on averaged thresholds.
                          </p>
                        </div>
                        
                        {improvement ? (
                          <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-300 leading-relaxed">
                              <span className="text-green-400 font-medium">Potential:</span> Gain ~<span className="text-white font-bold">{improvement.pointsNeeded} marks</span> to reach grade <span className="text-green-400 font-bold">{improvement.nextGrade}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-300 leading-relaxed">
                              <span className="text-green-400 font-medium">★ Top Grade!</span> You&apos;ve achieved the highest possible grade. Excellent work!
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {percentage < 50 && (
                        <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-sm text-yellow-300">
                            <span className="font-medium">💡 Tip:</span> Focus on past paper practice and understanding mark schemes for improvement.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Overall Summary */}
              <div className="mt-8 p-5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center max-w-4xl mx-auto">
                <p className="text-sm text-gray-300">
                  <span className="text-purple-400 font-medium">Note:</span> These predictions are based on historical Cambridge threshold data averaged over 10 years (2015-2024). 
                  Actual grade boundaries may vary slightly each session. Use these predictions as a guide for your revision strategy.
                </p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 pb-8">
              <p>Results based on 10-year averaged Cambridge thresholds (2015-2024)</p>
              <p className="text-purple-400/60 mt-1">Powered by CamBright Intelligence</p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default PredictorPage;
