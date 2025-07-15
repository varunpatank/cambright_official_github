// v0.0.01 salah

"use client"; // Ensure this is a client component

import { useParams } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import YearCard from "@/components/ui/number-card"; // Adjust the import path if needed
import Link from "next/link";
import Tilt from "react-parallax-tilt";
import { SearchInputSubjects } from "@/components/search-input-subjects";
import FloatingMCQNavbar from "@/components/FloatingMCQNavbar";

// Define the standard years and special cases
const years = [
  "2025 Specimen",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
];

// Define the special subjects
const specialSubjects = ["ESL", "AddMaths", "Maths"];

const YearPage = () => {
  const params = useParams();
  const subject = params?.subject as string;

  // Define the filtered years based on the subject
  let filteredYears: string[];

  if (subject === "ESL") {
    filteredYears = years.map((year) =>
      year === "2024" ? "2024 Specimen" : year
    );
  } else if (specialSubjects.includes(subject)) {
    filteredYears = years;
  } else {
    filteredYears = years.filter((year) => !year.includes("Specimen"));
  }

  // Function to format the URL year
  const formatYearForUrl = (year: string) => {
    if (year === "2025 Specimen") {
      return "2025sp";
    }
    if (year === "2024 Specimen") {
      return "2024sp";
    }
    return year;
  };

  return (
    <div className="relative flex flex-col bg-n-8 bg-grid-white/[0.1]">
      <FloatingMCQNavbar />
      <div className="flex-grow p-8">
        <h1 className="text-center text-3xl font-bold text-white opacity-90 mb-8">
          Please select <span className="text-purple-500">{subject}</span> paper
          year
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
          {filteredYears.map((year, index) => (
            <Tilt key={year}>
              <div className="relative">
                <Link href={`/mcq-solver/${subject}/${formatYearForUrl(year)}`}>
                  <YearCard title={year} gradientIndex={index} />
                </Link>
              </div>
            </Tilt>
          ))}
        </div>
      </div>
      <div className="mb-14"></div>{" "}
    </div>
  );
};

export default YearPage;
