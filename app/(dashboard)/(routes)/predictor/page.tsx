"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FloatingDock } from "./_components/floating-dock";
import {
  IconCalculator,
  IconExchange,
  IconHome,
  IconTerminal2,
} from "@tabler/icons-react";
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
import { Subject } from "@prisma/client";
import SubjectIcon from "../tutor/courses/_components/subject-icon";
import { calculateGradeFromAveragedThresholds } from "./_components/thresholdData";

const links = [
  {
    title: "Main",
    icon: <IconHome className="h-full w-full text-neutral-300" />,
    href: "#",
  },
  {
    title: "Predictor",
    icon: <IconTerminal2 className="h-full w-full text-neutral-300" />,
    href: "predictor",
  },
  {
    title: "Calculator",
    icon: <IconCalculator className="h-full w-full text-neutral-300" />,
    href: "#",
  },
  {
    title: "Generator",
    icon: <IconExchange className="h-full w-full text-neutral-300" />,
    href: "quizzer",
  },
];

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
  const [isDockVisible, setIsDockVisible] = useState(true);
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
    <div className="min-h-screen bg-black-100 pt-8">
      <div className="p-6 mx-auto max-w-7xl">
        {/* Title at Top */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-3">
            IGCSE GRADE PREDICTOR.
          </h1>
          <p className="text-lg font-normal text-purple-300 mb-2">
            Most Reliable IGCSE Predictor - Based on 10-Year Averaged Cambridge Thresholds
          </p>
          <p className="text-sm text-gray-400">
            Threshold data averaged from 2015-2024 Cambridge grade boundaries
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-purple-950 rounded-lg p-6 mb-6 border border-purple-800">
          <h2 className="text-lg font-medium text-white mb-4">
            Exam Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Session Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Exam Session</label>
              <Select onValueChange={(value) => setSession(value)}>
                <SelectTrigger className="bg-purple-900 border-purple-700 text-white">
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
              <label className="block text-sm text-gray-300 mb-2">Paper Variant</label>
              <Select onValueChange={(value) => setVariant(value)}>
                <SelectTrigger className="bg-purple-900 border-purple-700 text-white">
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
            <div className="flex items-center gap-4">
              <Select onValueChange={(value) => addSubject(Number(value))}>
                <SelectTrigger className="bg-purple-700 hover:bg-purple-600 text-white border-0 w-48">
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
                    <div key={subject.id} className="bg-purple-800 border border-purple-700 rounded-full px-3 py-1 flex items-center gap-2">
                      <SubjectIcon icon={iconMap[subject.name]} />
                      <span className="text-white text-sm">{subject.name}</span>
                      <button
                        onClick={() => removeSubject(subject.id)}
                        className="text-red-400 hover:text-red-300"
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
                <div key={subjectId} className="bg-purple-950 rounded-lg p-6 border border-purple-800">
                  <div className="flex items-center gap-3 mb-4">
                    <SubjectIcon icon={iconMap[subject?.name || "Mathematics"]} />
                    <h3 className="text-lg font-medium text-white">{subject?.name}</h3>
                    <span className="text-sm text-gray-400">
                      ({gradingsystemwithcode(subjectDetail.gradingSystem, subjectDetail.code)})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Level Selection */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Level</label>
                      <Select onValueChange={(value) => handleExtendedCoreChange(subjectId, value)}>
                        <SelectTrigger className="bg-purple-900 border-purple-700 text-white">
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
                      <label className="block text-sm text-gray-300 mb-2">Grading System</label>
                      <Select onValueChange={(value) => handleGradingSystemChange(subjectId, value)}>
                        <SelectTrigger className="bg-purple-900 border-purple-700 text-white">
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
                  {subjectDetail.papers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3">Paper Marks</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjectDetail.papers.map((paper) => (
                          <div key={paper} className="bg-purple-900 rounded p-3">
                            <label className="block text-sm text-gray-300 mb-2">
                              {paper}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={getMaxMarks(subjectId, paper)}
                                onChange={(e) => handleMarkChange(subjectId, paper, e.target.value)}
                                className="bg-purple-800 border border-purple-700 rounded px-3 py-2 text-white w-20 text-center focus:border-purple-500 focus:outline-none"
                                placeholder="0"
                              />
                              <span className="text-gray-400">/ {getMaxMarks(subjectId, paper)}</span>
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
              className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 text-lg font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                "Predict My Grades"
              )}
            </Button>
          </div>
        )}

        {/* Results Table */}
        {showResults && Object.keys(predictions).length > 0 && (
          <div className="bg-purple-950 rounded-lg p-6 border border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-white">
                Predicted Results: {session && sessionmap[session as keyof typeof sessionmap]}
              </h2>
              <div className="no-print">
                <PrintButton />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-purple-900 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-purple-800">
                    <th className="px-6 py-3 text-left text-white font-medium">Subject</th>
                    <th className="px-6 py-3 text-left text-white font-medium">Qualification</th>
                    <th className="px-6 py-3 text-left text-white font-medium">Predicted Grade</th>
                    <th className="px-6 py-3 text-left text-white font-medium">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSubjects.map((subjectId, index) => {
                    const subject = subjectsList.find(subj => subj.id === subjectId);
                    const subjectDetail = subjectInfo[subjectId] || {};
                    const prediction = predictions[subjectId] || { grade: "U", totalMarks: 0 };
                    
                    return (
                      <tr key={subjectId} className={`${index % 2 === 0 ? 'bg-purple-900/70' : 'bg-purple-900/50'} border-b border-purple-700`}>
                        <td className="px-6 py-3 text-white">
                          <div className="flex items-center gap-3">
                            <SubjectIcon icon={iconMap[subject?.name || "Mathematics"]} />
                            <div>
                              <div className="font-medium">{subject?.name} {subjectDetail.extendedCore}</div>
                              <div className="text-sm text-gray-300">
                                ({gradingsystemwithcode(subjectDetail.gradingSystem, subjectDetail.code)})
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-white">
                          IGCSE {subjectDetail.gradingSystem === "9-1" ? "(9-1)" : ""}
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold bg-white text-purple-900">
                            {prediction.grade}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-white font-medium">
                          {prediction.totalMarks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center text-sm text-gray-400">
              <p>Results based on 10-year averaged Cambridge thresholds (2015-2024)</p>
            </div>
            
            {/* Bottom spacing for scrolling */}
            <div className="h-32"></div>
          </div>
        )}

        {/* Floating Dock */}
        <div className="fixed bottom-4 left-20 right-0 flex items-center justify-center w-full">
          {isDockVisible && (
            <div className="mb-4 ml-4">
              <FloatingDock
                mobileClassName="translate-x-20"
                items={links}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictorPage;
