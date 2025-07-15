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
      title: "AddMaths (0606) - 2023 June P1 V1",
      href: "/Solved past papers/Additional Mathematics 0606/2023/May June/0606 s23 11 solved.pdf",
    },
    {
      title: "AddMaths (0606) - 2023 June P1 V2",
      href: "/Solved past papers/Additional Mathematics 0606/2023/May June/0606 s23 12 solved.pdf",
    },
    {
      title: "AddMaths (0606) - 2023 June P1 V3",
      href: "/Solved past papers/Additional Mathematics 0606/2023/May June/0606 s23 13 solved.pdf",
    },
    {
      title: "AddMaths (0606) - 2023 June P2 V1",
      href: "/Solved past papers/Additional Mathematics 0606/2023/May June/0606 s23 21 solved.pdf",
    },
    {
      title: "AddMaths (0606) - 2023 June P2 V2",
      href: "/Solved past papers/Additional Mathematics 0606/2023/May June/0606 s23 22 solved.pdf",
    },
    {
      title: "AddMaths (0606) - 2023 June P2 V3",
      href: "/Solved past papers/Additional Mathematics 0606/2023/May June/0606 s23 23 solved.pdf",
    },

    {
      title: "Business (0450) - 2023 June P1 V1 ",
      href: "/Solved past papers/Business 0450/2023/May June/0450 s23 11 solved.pdf",
    },
    {
      title: "Business (0450) - 2023 Oct/Nov P1 V1 ",
      href: "/Solved past papers/Business 0450/2023/October November/0450 w23 11 solved.pdf",
    },
    {
      title: "Business (0450) - 2023 Oct/Nov P1 V2 ",
      href: "/Solved past papers/Business 0450/2023/October November/0450 w23 12 solved.pdf",
    },
    {
      title: "Business (0450) - 2023 Oct/Nov P1 V3 ",
      href: "/Solved past papers/Business 0450/2023/October November/0450 w23 13 solved.pdf",
    },

    {
      title: "Chemistry (0620) - 2023 May/June P2 V1 ",
      href: "/Solved past papers/Chemistry 0620/2023/May-June/0620 s23 21 solved.pdf",
    },
    {
      title: "Chemistry (0620) - 2023 May/June P2 V2 ",
      href: "/Solved past papers/Chemistry 0620/2023/May-June/0620 s23 22 solved.pdf",
    },
    {
      title: "Chemistry (0620) - 2023 May/June P4 V1 ",
      href: "/Solved past papers/Chemistry 0620/2023/May-June/0620 s23 41 solved.pdf",
    },
    {
      title: "Chemistry (0620) - 2023 May/June P4 V2 ",
      href: "/Solved past papers/Chemistry 0620/2023/May-June/0620 s23 42 solved.pdf",
    },

    {
      title: "Computer Science (0478) - 2023 May/June P1 V1 ",
      href: "/Solved past papers/Computer Science 0478/2023/May June/0478 s23 11 solved.pdf",
    },
    {
      title: "Computer Science (0478) - 2023 May/June P1 V2 ",
      href: "/Solved past papers/Chemistry 0620/2023/May June/0478 s23 12 solved.pdf",
    },

    {
      title: "Maths (0580/0980) - 2024 Feb/March P2 V2 ",
      href: "/Solved past papers/Mathematics 0580/2024/Feb March/0580 m24 22 solved.pdf",
    },
    {
      title: "Maths (0580/0980) - 2024 Feb/March P4 V2  ",
      href: "/Solved past papers/Mathematics 0580/2024/Feb March/0580 m24 42 solved.pdf",
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
            Solved Past Papers
          </h2>
          <p className="text-lg text-slate-300 mb-6">
            Past Papers Solved by Expert tutors & Successful students, with
            Model Answers!
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
