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
import { ListChecks } from "lucide-react";
import FloatingMCQNavbar from "@/components/FloatingMCQNavbar";

// Mapping object for subject name replacements
const subjectMapping: Record<string, string> = {
  Biology: "Biology",
  Chemistry: "Chem",
  Physics: "Phys",
  Economics: "Economics",
};

// Hardcoded images
const images: Record<string, string> = {
  Biology: "/bioTH.png",
  Chemistry: "/chemTH.png",
  Physics: "/physTH.png",
  "Economics": "/accountingTH.png",
};

const subjects = ["Biology", "Chemistry", "Physics", "Economics"];

const PastPapersMainPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter subjects based on the search term
  const filteredSubjects = subjects.filter((subject) =>
    subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="relative flex flex-col">
        <div className="absolute top-0 z-[-2] w-full h-screen bg-[#000000]  bg-[radial-gradient(#ffffff33_1px,#0e0c15_1px)] bg-[size:20px_20px]"></div>
        <FloatingMCQNavbar />
        <div className="flex-grow p-8">
          <div className="flex flex-col items-center mb-8 ">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-white opacity-90 flex items-center justify-center gap-2">
                <ListChecks className="w-8 h-8" />
                MCQ Mock Exams
              </h1>
            </div>
            <SearchInputSubjects setSearchTerm={setSearchTerm} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
            {filteredSubjects.map((subject, index) => {
              const displaySubject = subjectMapping[subject] || subject;
              const image =
                images[subject] ||
                "https://images.unsplash.com/photo-1512618831669-521d4b375f5d?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Fallback image

              return (
                <Tilt key={subject}>
                  <div className="relative">
                    <Link href={`/mcq-solver/${displaySubject}`}>
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
