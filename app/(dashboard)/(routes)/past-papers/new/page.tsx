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

const PastPapersMainPage = () => {
  // Sample list of past papers
  const pastPapers = [
    {
      title: "Edexcel IAL/AS Biology 2024 October - Unit 1",
      href: "/Unit 1.pdf",
    },
    {
      title: "Edexcel IAL/AS Biology 2024 October - Unit 2",
      href: "/Unit 2.PDF.pdf",
    },
    {
      title: "Edexcel IAL/AS Biology 2024 October - Unit 3",
      href: "/Unit 3.PDF.pdf",
    },
    {
      title: "Edexcel IAL/AS Biology 2024 October - Unit 4",
      href: "/Unit 4.PDF.pdf",
    },
    {
      title: "Edexcel IAL/AS Biology 2024 October - Unit 5",
      href: "/Unit 5.PDF.pdf",
    },
    {
      title: "Edexcel IAL/AS Biology 2024 October - Unit 6",
      href: "/Unit 6.pdf",
    },
    {
      title: "Edexcel IAL/AS Chemistry 2024 October - Unit 1",
      href: "/Unit 1.pdf",
    },
  ];

  return (
    <>
      <div className="h-full w-full bg-n-8 bg-grid-white/[0.1] fixed top-0 left-0 flex flex-col">
        {/* Background layer */}
      </div>
      <div className="relative flex flex-col">
        <FloatingNavbar />
        {/* Add a section for the past papers list */}
        <div className="flex-grow p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Latest Past Papers
          </h2>
          <p className="text-lg text-slate-300 mb-6">
            Here you can find latest 2024, 2025 Papers (The MS for some of them,
            might not be published yet)
          </p>

          {/* List of past papers with links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPapers.map((paper, index) => (
              <div
                key={index}
                className="group rounded-lg overflow-hidden shadow-lg bg-purple-900 bg-opacity-90 hover:bg-opacity-80 transition-all duration-300"
              >
                <Link href={paper.href}>
                  <Tilt
                    perspective={1000}
                    glareEnable={true}
                    glareMaxOpacity={0.1}
                    glarePosition="all"
                    scale={1.05}
                  >
                    <div className="block p-6 text-center">
                      <div className="text-xl font-semibold text-white hover:text-white transition-colors duration-300 mb-2">
                        {paper.title}
                      </div>
                      <p className="text-md text-slate-200 mb-4">
                        Click to view the solved paper.
                      </p>
                    </div>
                  </Tilt>
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-8"></div>{" "}
        {/* Adding space at the bottom of the page */}
      </div>
    </>
  );
};

export default PastPapersMainPage;
