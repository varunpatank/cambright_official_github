// v0.0.01 salah

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import YearCard from "@/components/ui/number-card";
import { Calendar } from "lucide-react";

// Map of session names to abbreviations
const sessionMap: { [key: string]: string } = {
  "Feb/March": "FM",
  "May/June": "MJ",
  "October/November": "ON",
};

const sessions = Object.keys(sessionMap);

const YearPage = () => {
  const params = useParams();

  const subject = params?.subject;
  const year = params?.year;

  if (!subject || !year) {
    return <div>Error: Missing subject or year.</div>;
  }

  // Function to get the abbreviated session name
  const getSessionAbbreviation = (session: string) => {
    return sessionMap[session] || session; // Default to original if not found
  };

  // Filter sessions based on the year
  const filteredSessions = year === "2024" ? ["Feb/March"] : sessions;

  return (
    <div className="mt-8">
      <FloatingNavbar />
      <h1 className="text-center text-3xl font-bold text-white opacity-90 mb-8">
        {subject} Past Papers {year}
      </h1>
      <ul className="text-center">
        {filteredSessions.map((session, index) => {
          const abbreviation = getSessionAbbreviation(session);
          return (
            <li key={session} className="mb-2">
              <Link href={`/past-papers/${subject}/${year}/${abbreviation}`}>
                <YearCard title={session} gradientIndex={index} icon />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default YearPage;
