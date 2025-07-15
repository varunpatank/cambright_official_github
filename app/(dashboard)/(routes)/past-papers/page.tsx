"use client";
// v0.0.01 salah
import FloatingNavbar from "@/components/FloatingNavbar";
import { SearchInputSubjects } from "@/components/search-input-subjects";
import Card from "@/components/ui/glare-card";
import Link from "next/link";
import Tilt from "react-parallax-tilt";
import { useState } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GlateCard from "@/components/ui/glatecard";
import SolvedCard from "./_components/SolvedCard";
import NewCard from "./_components/NewCard";

// Mapping object for subject name replacements
const subjectMapping: Record<string, string> = {
  Biology: "Biology",
  Chemistry: "Chemistry",
  Physics: "Physics",
  Maths: "Mathematics",
  BusinessStudies: "Business-Studies",
  Englishasa2ndLang: "English",
  EnglishLiterature: "English0475",
  EnglishFirstLang: "English",
  ComputerScience: "Computer-science",
  Accounting: "Accounting",
  ICT: "ict0417",
  AddMaths: "mathematics-additional",
};

// Hardcoded images
const images: Record<string, string> = {
  Biology: "/bioTH.png",
  Maths: "/mathsTH.png",
  AddMaths: "/addmathsTH.png",
  Chemistry: "/chemTH.png",
  Physics: "/physTH.png",
  Accounting: "/accountingTH.png",
  BusinessStudies: "/businessTH.png",
  Englishasa2ndLang: "/eslTH.png",
  EnglishLiterature: "/literatureTH.png",
  EnglishFirstLang: "/eflTH.png",
  ComputerScience: "/csTH.png",
  ICT: "/ictTH.png",
};

// List of subjects
const subjects = [
  "Biology",
  "Maths",
  "AddMaths",
  "Chemistry",
  "Physics",
  "Accounting",
  "BusinessStudies",
  "Englishasa2ndLang",
  "EnglishLiterature",
  "EnglishFirstLang",
  "ComputerScience",
  "ICT",
];

const PastPapersMainPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter subjects based on the search term
  const filteredSubjects = subjects.filter((subject) =>
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="h-full w-full bg-n-8 bg-grid-white/[0.1] fixed top-0 left-0 flex flex-col">
        {/* Background layer */}
      </div>
      <div className="relative flex flex-col">
        <FloatingNavbar />
        <div className="flex-grow p-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-center text-3xl font-bold text-white opacity-90 mb-4">
              Past Papers
            </h1>
            <SearchInputSubjects setSearchTerm={setSearchTerm} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
            {" "}
            <Tilt key={"New"}>
              <SolvedCard />
            </Tilt>
            <Tilt key={"Latest"}>
              <NewCard />
            </Tilt>
            {filteredSubjects.map((subject, index) => {
              const displaySubject = subjectMapping[subject] || subject;
              const image =
                images[subject] ||
                "https://images.unsplash.com/photo-1512618831669-521d4b375f5d?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Fallback image

              return (
                <Tilt key={subject}>
                  <div className="relative">
                    <Link href={`/past-papers/${displaySubject}`}>
                      <Card
                        backgroundImage={image}
                        title={subject}
                        gradientIndex={index}
                      />
                    </Link>
                  </div>
                </Tilt>
              );
            })}
          </div>
        </div>
        <div className="mb-8"></div>{" "}
        {/* Adding space at the bottom of the page */}
      </div>
    </>
  );
};

export default PastPapersMainPage;
 
