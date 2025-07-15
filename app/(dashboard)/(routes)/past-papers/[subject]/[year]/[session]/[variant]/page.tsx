// v0.0.01 salah

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import Tilt from "react-parallax-tilt";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Adjust path if needed

const levels = ["Extended", "Core"];

const VariantPage = () => {
  const params = useParams();
  const subject = params?.subject;
  const year = params?.year;
  const session = params?.session;
  const variant = params?.variant;

  if (!subject || !year || !session || !variant) {
    return <div>Error: Missing subject or year.</div>;
  }
  return (
    <div className="relative bg-transparent text-white">
      <FloatingNavbar />
      <div className="flex flex-col items-center p-8">
        <h1 className="text-center text-3xl font-bold text-white opacity-90 mb-8">
          {subject} {year}, {session} {variant}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
          {levels.map((level) => (
            <Tilt
              key={level}
              className="w-full sm:w-64 md:w-80 h-48 sm:h-64 md:h-64"
            >
              <Link
                href={`/past-papers/${subject}/${year}/${session}/${variant}/${level}`}
                className="block"
              >
                <Card className="transition-transform transform hover:scale-105 bg-gray-800 shadow-lg relative overflow-hidden">
                  <CardHeader
                    className={`p-4 text-white ${
                      level === "Core" ? "bg-yellow-600" : "bg-purple-600"
                    }`}
                  >
                    <div className="text-xl font-semibold">{level}</div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-lg text-center">
                      <span className="font-bold text-xl sm:text-2xl">
                        {level}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Tilt>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VariantPage;
