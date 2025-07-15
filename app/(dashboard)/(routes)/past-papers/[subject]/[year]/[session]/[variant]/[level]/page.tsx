// v0.0.01 salah

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Tilt from "react-parallax-tilt";
import { Mathematics } from "novel/extensions";

// Define mappings for subject codes, session codes, and variant codes
const subjectCodes: { [key: string]: string } = {
  Biology: "0610",
  Chemistry: "0620",
  Physics: "0625",
  Mathematics: "0580",
  "Business-Studies": "0450",
  English2: "0510",
  English:"0500",
  "english0475": "0475", // English Literature
  "Computer-science": "0478",
  Accounting: "0452",
  "ict0417": "0417",
  "mathematics-additional": "4037",
};


const sessionCodes: { [key: string]: string } = {
  FM: "m",
  ON: "w",
  MJ: "s",
};

// Define a mapping of paper names to their images
const paperImages: { [key: string]: string } = {
  "Paper1.pdf": "/paper2.png",
  "Paper1ms.pdf": "/paper2.png",
  "Paper3.pdf": "/paper4.png",
  "Paper3ms.pdf": "/paper4.png",
  "Paper6.pdf": "/paper6.png",
  "Paper6ms.pdf": "/paper6.png",
  "Paper2.pdf": "/paper2.png",
  "Paper2ms.pdf": "/paper2.png",
  "Paper4.pdf": "/paper4.png",
  "Paper4ms.pdf": "/paper4.png",
};

// Define custom colors
const colors = {
  paper2: { bg: "bg-cyan-700", hover: "bg-cyan-900" },
  paper4: { bg: "bg-emerald-700", hover: "bg-emerald-800" },
  paper1: { bg: "bg-cyan-800", hover: "bg-cyan-900" },
  paper3: { bg: "bg-emerald-800", hover: "bg-emerald-800" },
  paper5: { bg: "bg-pink-600", hover: "bg-pink-900" },
  paper6: { bg: "bg-pink-600", hover: "bg-pink-900" },
};
const subjectMapping: Record<string, string> = {
  Biology: "Biology",
  Chemistry: "Chemistry",
  Physics: "Physics",
  Maths: "Mathematics",
  BusinessStudies: "Business-Studies",
  Englishasa2ndLang: "English2",
  EnglishLiterature: "english0475",
  EnglishFirstLang: "English",
  ComputerScience: "Computer-science",
  Accounting: "Accounting",
  ICT: "ict0417",
  AddMaths: "mathematics-additional",
};


const LevelPage = () => {
  const params = useParams();
  const { subject, year, session, variant, level } = params as {
    [key: string]: string;
  };

  // Log parameters and converted subjectCode
  console.log("Parameters:", params);
  console.log("Subject Parameter:", subject);
  console.log("Subject Code from Mapping:", subjectCodes[subject]);

  // Get the subject code, session code, and variant code
const mappedSubject = subjectMapping[subject] || subject;
const subjectCode = subjectCodes[mappedSubject] || "UNKNOWN_SUBJECT";

  const sessionCode = sessionCodes[session] || "";

  // Extract the last two digits of the year
  const yearCode = year.slice(-2);

  // Determine the variant code by removing 'V' from the variant parameter
  const variantCode = variant.replace("V", "");

  // Determine paper code based on title
  const getPaperCode = (title: string) => {
    const paperNumberMatch = title.match(/Paper (\d+)/);
    return paperNumberMatch ? paperNumberMatch[1] : "";
  };

  // Function to get the appropriate papers based on the subject and level
  const getPapersForSubject = (subject: string, level: string) => {
    switch (subject) {
      case "Maths":
      case "ESL":
        return level === "Core"
          ? [
              { title: "Paper 1", fileName: "Paper2.pdf" },
              { title: "Paper 3", fileName: "Paper4.pdf" },
            ]
          : [
              { title: "Paper 2", fileName: "Paper2.pdf" },
              { title: "Paper 4", fileName: "Paper4.pdf" },
            ];

      case "AddMaths":
        return level === "Core"
          ? [
              { title: "Paper 1", fileName: "Paper1.pdf" },
              { title: "Paper 2", fileName: "Paper2.pdf" },
            ]
          : [
              { title: "Paper 1", fileName: "Paper1.pdf" },
              { title: "Paper 2", fileName: "Paper2.pdf" },
            ];

      case "EFL":
      case "Accounting":
      case "Business":
        return level === "Core"
          ? [
              { title: "Paper 1", fileName: "Paper1.pdf" },
              { title: "Paper 2", fileName: "Paper2.pdf" },
            ]
          : [
              { title: "Paper 1", fileName: "Paper1.pdf" },
              { title: "Paper 2", fileName: "Paper2.pdf" },
            ];

      default:
        return level === "Core"
          ? [
              { title: "Paper 1", fileName: "Paper1.pdf" },
              { title: "Paper 3", fileName: "Paper3.pdf" },
              { title: "Paper 6", fileName: "Paper6.pdf" },
            ]
          : [
              { title: "Paper 2", fileName: "Paper2.pdf" },
              { title: "Paper 4", fileName: "Paper4.pdf" },
              { title: "Paper 6", fileName: "Paper6.pdf" },
            ];
    }
  };

  const papers = getPapersForSubject(subject, level);

  return (
    <div className="relative">
      <FloatingNavbar />
      <div className="flex flex-col items-center p-8 pb-24 md:pb-8">
        <h1 className="text-center text-4xl font-bold text-white opacity-90 mb-12">
          {subject} {year}, {session} {variant} {level} Papers
        </h1>
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {papers.map((paper) => {
              // Determine whether there is an MS paper for the current paper
              const msPaperFileName = paper.fileName.replace(".pdf", "ms.pdf");
              const hasMsPaper = Boolean(paperImages[msPaperFileName]);

              // Determine the background color based on the paper title
              let cardColor = "bg-purple-800";
              let hoverColor = "bg-purple-700";

              if (paper.title.includes("Paper 2")) {
                cardColor = colors.paper2.bg;
                hoverColor = colors.paper2.hover;
              } else if (paper.title.includes("Paper 4")) {
                cardColor = colors.paper4.bg;
                hoverColor = colors.paper4.hover;
              } else if (paper.title.includes("Paper 1")) {
                cardColor = colors.paper1.bg;
                hoverColor = colors.paper1.hover;
              } else if (paper.title.includes("Paper 3")) {
                cardColor = colors.paper3.bg;
                hoverColor = colors.paper3.hover;
              } else if (
                paper.title.includes("Paper 5") ||
                paper.title.includes("Paper 6")
              ) {
                cardColor = colors.paper5.bg;
                hoverColor = colors.paper5.hover;
              }

              const getFullSessionName = (session: string, year: string) => {
  const yearNum = parseInt(year, 10);
  if (yearNum < 2018) {
    switch (session) {
      case "FM": return "mar";
      case "MJ": return "jun";
      case "ON": return "nov";
      default: return "unknown-session";
    }
  } else {
    switch (session) {
      case "FM": return "march";
      case "MJ": return "may-june";
      case "ON": return "october-november";
      default: return "unknown-session";
    }
  }
};




              // Calculate the paper code
              const paperCode = getPaperCode(paper.title);

              return (
                <Tilt
                  key={paper.fileName}
                  tiltReverse={true}
                  glareEnable={true}
                  glareMaxOpacity={0.4}
                  glareColor="white"
                >
                  <div
                    className={`relative flex flex-col w-full max-w-lg ${cardColor} rounded-lg shadow-2xl overflow-hidden`}
                  >
                    <Link
  href={`https://pastpapers.papacambridge.com/viewer/caie/igcse-${subject.toLowerCase()}-${subjectCode}-${year}-${getFullSessionName(session, year)}-${subjectCode}-${sessionCode}${yearCode}-qp-${paperCode}${variantCode}-pdf`}
  className={`relative flex flex-col h-full ${cardColor} transition-all duration-300`}
>

                      <div className={`flex-1 p-8 group-hover:${hoverColor}`}>
                        <h2 className="text-2xl font-semibold text-white group-hover:text-gray-200 transition-all duration-300 hover:underline">
                          {paper.title}
                        </h2>
                      </div>
                      {hasMsPaper && (
                        <div className="p-4 bg-purple-900 text-center">
                          <Link
  href={`https://pastpapers.papacambridge.com/viewer/caie/igcse-${subject.toLowerCase()}-${subjectCode}-${year}-${getFullSessionName(session, year)}-${subjectCode}-${sessionCode}${yearCode}-ms-${paperCode}${variantCode}-pdf`}
  className="text-white hover:underline transition-all"
>

                            <h2 className="text-2xl font-semibold">MS</h2>
                          </Link>
                        </div>
                      )}
                    </Link>
                  </div>
                </Tilt>
              );
            })}
          </div>
        </div>
      </div>
      <div className="h-24 md:h-0"></div>
    </div>
  );
};

export default LevelPage;
 
