"use client";
import React, { useState, useEffect } from "react";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { answersData } from "./data/OL_subjects_ms";
import {
  Check,
  X,
  ChevronDown,
  File,
  ChevronLeft,
  ChevronRight,
  Timer,
  Plus,
  ChevronUp,
  Pause,
  Play,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LearnButton } from "@/components/ui/learnbutton";
import { IconPdf } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import FloatingNavbar from "@/components/FloatingNavbar";
import FloatingMCQNavbar from "@/components/FloatingMCQNavbar";
import { useParams } from "next/navigation";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { ConfirmModalEnroll } from "@/components/modals/confirm-modal-enroll";

const MCQSolverPage: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [customTime, setCustomTime] = useState<number | "">(45);
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTPaused, setIsTPaused] = useState(false);

  const confetti = useConfettiStore();
  // const params = useParams();
  // const { subject, year, session } = params as {
  //   [key: string]: string;
  // };
  type VariantType = "1" | "2" | "3"; // You can expand this type if there are more possible variants
  interface RouteParams {
    [key: string]: string | string[];
    variant: VariantType; // Define the variant type here
    // Use string | string[] as expected
  }

  const params = useParams<RouteParams>();
  type SubjectType = "Physics" | "Biology" | "Chemistry"; // List all possible subjects
  type YearType =
    | "2016"
    | "2017"
    | "2018"
    | "2019"
    | "2020"
    | "2021"
    | "2022"
    | "2023"
    | "2024";
  type SessionType = "m" | "s" | "w"; // Adjust according to your session types
  const sessionCodes: { [key: string]: string } = {
    FM: "m",
    ON: "w",
    MJ: "s",
  };
  const subjectNames: { [key: string]: string } = {
    Chem: "Chemistry",
    Biology: "Biology",
    Phys: "Physics",
    Economics: "Economics",
  };
  // Extract parameters and assert their types
  const subject = (params?.subject as SubjectType) || "DefaultSubject"; // Ensure default or fallback
  const year = (params?.year as YearType) || "DefaultYear";
  const session = (params?.session as SessionType) || "DefaultSession";
  const sessionCode = sessionCodes[session] || "";
  const subjectName =
    (subjectNames[subject] as SubjectType) || "DefaultSubject";
  const sessionC = (sessionCode as SessionType) || "DefaultSession";
  const variant = (params?.variant as VariantType) || "1"; // Default to "1" if not found
  const subjectCodes: { [key: string]: string } = {
    Chem: "0620",
    Biology: "0610",
    Phys: "0625",
    Economics: "0455",
  };

  const subjectCode = subjectCodes[subject] || "UNKNOWN_SUBJECT";

  // Extract the last two digits of the year
  const yearCode = year.slice(-2);

  // Determine the variant code by removing 'V' from the variant parameter
  const variantCode = variant.replace("V", "");
  const code = "0625";
  function getVariantNumber(variant: string) {
    let result;
    switch (variant) {
      case "V1":
        result = 0;
        break;
      case "V2":
        result = 1;
        break;
      case "V3":
        result = 2;
        break;
      default:
        result = 1; // In case of an invalid variant
        break;
    }

    return result;
  }
  const correctAnswers =
    answersData[subjectName]?.[year]?.[sessionC]?.[getVariantNumber(variant)];

  const getMappedSession = (session: string) => {
    switch (session) {
      case "m":
        return "Feb-Mar";
      case "s":
        return "May-Jun";
      case "w":
        return "Oct-Nov";
      default:
        return "";
    }
  };

  const getMappedSessionvv = (session: string) => {
    switch (session) {
      case "m":
        return "March";
      case "s":
        return "June";
      case "w":
        return "November";
      default:
        return "";
    }
  };
  const getSubCode = (subject: string) => {
    switch (subject) {
      case "Physics":
        return "0625";
      case "Chemistry":
        return "0620";
      case "Physics":
        return "0625";
      case "Physics":
        return "0625";
      case "Physics":
        return "0625";
      default:
        return "";
    }
  };

  const lastTwoDigitsOfYear = year.slice(-2);

  const pdfUrl = `https://dynamicpapers.com/wp-content/uploads/2015/09/${getMappedSession(
    session
  )}/${subjectCode}_${sessionCode}${yearCode}_qp_${
    subjectCode === "0455" ? "1" : "2"
  }${variantCode}.pdf`;

  const pdfUrl_ms = `https://dynamicpapers.com/wp-content/uploads/2015/09/${getMappedSession(
    session
  )}/${subjectCode}_${sessionCode}${yearCode}_ms_${
    subjectCode === "0455" ? "1" : "2"
  }${variantCode}.pdf`;

  const handleSelectAnswer = (index: number, choice: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [index]: choice,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (correctAnswers) {
      confetti.onOpen();
      let totalCorrect = 0;
      correctAnswers.split("").forEach((correctAnswer, index) => {
        if (selectedAnswers[index] === correctAnswer) {
          totalCorrect++;
        }
      });

      const calculatedScore = totalCorrect;
      setScore(calculatedScore);
      if (!isTPaused) {
        handlePauseTimer();
      }
    }
  };

  const handleRevealAnswers = () => {
    setRevealAnswers(true);
    setIsSubmitted(false);
  };

  const handleReset = () => {
    setShowConfirmModal(true);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setRevealAnswers(false);
    setScore(null);
  };

  const handleSaveAnswers = () => {
    const answerString = Object.keys(selectedAnswers)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => selectedAnswers[Number(key)] || "-")
      .join("");
    alert(`Your answers: ${answerString}`);
  };

  const handleOpenPDF = () => {
    window.open(pdfUrl, "_blank");
  };
  const handleOpenPDF_ms = () => {
    window.open(pdfUrl_ms, "_blank");
  };

  const handleStartTimer = (minutes: number) => {
    const endTime = Date.now() + minutes * 60000;

    const intervalId = setInterval(() => {
      const timeLeft = Math.max(0, endTime - Date.now());
      setTimeLeft(Math.floor(timeLeft / 1000));

      if (timeLeft === 0) {
        clearInterval(intervalId);
        setTimer(null);
        setIsTimerRunning(false);
      }
    }, 1000) as unknown as NodeJS.Timeout;

    setTimer(intervalId);
    setIsTimerRunning(true);
    setShowCustomInput(false); // Hide custom input when preset timer is started
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTime(Number(e.target.value));
  };

  const handleStartCustomTimer = () => {
    if (customTime && typeof customTime === "number" && customTime > 0) {
      handleStartTimer(customTime);
      setCustomTime(45);
      setShowTimerDropdown(false);
    } else {
      alert("Please enter a valid time.");
    }
  };

  const handlePauseTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
      setIsTimerRunning(false);
      setIsTPaused(true);
    }
  };

  const handleResumeTimer = () => {
    if (timeLeft && timeLeft > 0) {
      handleStartTimer(Math.ceil(timeLeft / 60));
      setIsTPaused(false);
    }
  };

  const handleResetTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
      setIsTimerRunning(false);
    }
    setTimeLeft(null);
    setShowCustomInput(false); // Hide custom input when timer is reset
  };

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const getBackgroundColor = (
    index: number,
    choice: string,
    correctAnswer: string
  ) => {
    if (!isSubmitted && !revealAnswers) {
      return selectedAnswers[index] === choice ? "purple" : "#252134";
    }

    if (isSubmitted) {
      if (selectedAnswers[index] === choice) {
        return correctAnswer === choice ? "#84cc16" : "#e11d48";
      }

      if (selectedAnswers[index] === undefined) {
        return correctAnswer !== choice ? "#e11d48" : "#84cc16";
      }

      return correctAnswer === choice ? "#84cc16" : "#252134";
    }

    if (revealAnswers) {
      return correctAnswer === choice ? "#84cc16" : "#252134";
    }

    return "#252134";
  };

  const getMark = (index: number, correctAnswer: string) => {
    if (!isSubmitted) return null;

    if (selectedAnswers[index] === correctAnswer) {
      return <Check className="text-green-500" size={20} />;
    }

    if (selectedAnswers[index] !== correctAnswer) {
      return selectedAnswers[index] ? (
        <X className="text-rose-500" size={20} />
      ) : (
        ""
      );
    }
    return null;
  };

  const renderQuestions = () => {
    if (!correctAnswers) {
      return <div>No answers available for the selected exam.</div>;
    }

    return correctAnswers
      .split("")
      .map((correctAnswer: string, index: number) => (
        <div
          key={index}
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }} className="m-3">
            <div className="text-xl mb-2">
              Question <span>{index + 1}</span>
            </div>
            <div className="flex items-center">
              {["A", "B", "C", "D"].map((choice) => (
                <Button
                  size={"lg"}
                  key={choice}
                  type="button"
                  className="disabled:opacity-90 text-lg p-5 "
                  onClick={() => handleSelectAnswer(index, choice)}
                  style={{
                    backgroundColor: getBackgroundColor(
                      index,
                      choice,
                      correctAnswer
                    ),
                    color: "white",
                    margin: "0 5px",
                  }}
                  disabled={isSubmitted || revealAnswers}
                >
                  {choice}
                </Button>
              ))}
              <div style={{ marginLeft: "10px", fontSize: "24px" }}>
                {getMark(index, correctAnswer)}
              </div>
            </div>
          </div>
        </div>
      ));
  };

  // Log parameters and converted subjectCode

  // Get the subject code, session code, and variant code

  return (
    <>
      <div className="md:m-6 pb-24">
        <FloatingMCQNavbar />
        <h1 className="text-2xl ml-2 md:ml-0 mt-2 md:mt-0 mb-4">
          <span className="text-purple-400">{subjectName}</span>{" "}
          {getMappedSessionvv(sessionCode)} {year} {variant}
        </h1>
        <Button
          variant={"secondary"}
          onClick={handleOpenPDF}
          className="mb-2 ml-2"
        >
          Open PDF <File className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant={"secondary"}
          onClick={handleOpenPDF_ms}
          className="mb-2 ml-2"
        >
          MS <File className="w-5 h-5 ml-2" />
        </Button>
        <form onSubmit={handleSubmit}>
          {renderQuestions()}
          <Button
            variant={"success"}
            type="submit"
            style={{ marginTop: "20px" }}
            className="md:ml-0 ml-3"
          >
            Submit Answers
          </Button>
          <ConfirmModal
            onConfirm={handleReset}
            continueText="Reset"
            additionalText={`Are you sure you want to reset your answers?`}
            continueButtonColor="bg-rose-500 hover:bg-rose-800"
            typeToContinue={false}
          >
            <Button
              variant={"destructive"}
              type="button"
              // onClick={handleReset}
              style={{ marginLeft: "10px" }}
            >
              Reset
            </Button>
          </ConfirmModal>
          <Button
            variant={"secondary"}
            type="button"
            onClick={handleRevealAnswers}
            className="md:mt-0 mt-2"
            style={{ marginLeft: "10px" }}
          >
            Reveal Answers
          </Button>
        </form>
        {score !== null && (
          <div className="mt-8 mb-8 bg-n-6 rounded-lg p-6 max-w-80 mr-2 ml-2">
            <h2 className="text-2xl">
              Score: {score} / {correctAnswers?.length || 0} <br />{" "}
              <span
                className={`text-lg ${
                  score >= 3
                    ? score >= 10
                      ? score >= 20
                        ? score >= 30
                          ? score >= 35
                            ? "text-green-500"
                            : "text-blue-500"
                          : "text-yellow-500"
                        : "text-orange-500"
                      : "text-rose-500"
                    : "text-red-500"
                }`}
              >
                {score >= 3
                  ? score >= 10
                    ? score >= 20
                      ? score >= 30
                        ? score >= 35
                          ? "Amazing!"
                          : "Great"
                        : "Good"
                      : "Not bad"
                    : "Work harder"
                  : "Awful"}
              </span>
            </h2>
          </div>
        )}
        <div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-32 right-4 w-12 h-12 z-50 flex items-center justify-center p-2 text-white bg-n-6 rounded-full hover:bg-n-7 focus:outline-none transition-transform duration-300"
          >
            <div
              className={`flex items-center space-x-2 transition-transform duration-300`}
            >
              {!isSidebarOpen ? (
                <Timer className="w-8 h-8" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </div>
          </button>
          <div
            className={`fixed top-28 rounded-lg right-0 h-full bg-n-6 shadow-lg transform transition-transform ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            } z-40 w-80 overflow-y-auto`}
          >
            <div className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={() => setShowTimerDropdown(!showTimerDropdown)}
                  className="flex items-center px-4 py-2 text-white bg-n-5 rounded-md hover:bg-n-5 focus:outline-none "
                >
                  <Plus size={20} className="text-white" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-2 bg-n-5 rounded-md ">
                  <DropdownMenuItem
                    onClick={() => {
                      handleStartTimer(45);
                      setShowTimerDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-n-6 cursor-pointer"
                  >
                    45 mins
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleStartTimer(40);
                      setShowTimerDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-n-6 cursor-pointer"
                  >
                    40 mins
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowCustomInput(true)}
                    className="px-4 py-2 hover:bg-n-6 cursor-pointer"
                  >
                    Custom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {showCustomInput && (
                <div className="mt-4 flex items-center">
                  <Input
                    type="number"
                    value={customTime}
                    onChange={handleCustomTimeChange}
                    placeholder="Enter minutes"
                    className="px-3 py-2  bg-n-5 rounded-md "
                  />
                  <Button
                    onClick={handleStartCustomTimer}
                    variant={"tert"}
                    className="ml-3 px-4 py-2 text-white rounded-md"
                  >
                    Start Custom Timer
                  </Button>
                </div>
              )}

              <div className="mt-4">
                {timeLeft !== null && timeLeft > 0 ? (
                  <div className=" items-center">
                    <span className="text-xl text-gray-100">
                      Time Left:{" "}
                      <span className="text-2xl font-semibold">
                        {Math.floor(timeLeft / 60)}:
                        {String(timeLeft % 60).padStart(2, "0")}
                      </span>
                    </span>
                    <br />
                    <div className="ml-0 space-x-2 mt-4 flex">
                      {isTPaused ? (
                        <Button
                          type="button"
                          onClick={handleResumeTimer}
                          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <Play className="h-5 mr-2 w-5" /> Resume
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePauseTimer}
                          className="px-4 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <Pause className="h-5 mr-2 w-5" /> Pause
                        </Button>
                      )}
                      <Button
                        onClick={handleResetTimer}
                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        <Trash className="h-5 mr-2 w-5" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : isTimerRunning ? (
                  <div className="text-center text-red-400 font-semibold">
                    Time is up!
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    No Timer Running
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MCQSolverPage;
