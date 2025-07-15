// v0.0.01 salah

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import FloatingNavbar from "@/components/FloatingNavbar";
import { Card, CardContent } from "@/components/ui/card";

// Map of variant names to abbreviations
const variantMap: { [key: string]: string } = {
  "Variant 1": "V1",
  "Variant 2": "V2",
  "Variant 3": "V3",
};

const allVariants = Object.keys(variantMap);

const SessionPage = () => {
  const params = useParams();
  const subject = params?.subject;
  const year = params?.year;
  const session = params?.session;

  if (!subject || !year || !session) {
    return <div>Error: Missing subject or year.</div>;
  }
  // Function to get the abbreviated variant name
  const getVariantAbbreviation = (variant: string) => {
    return variantMap[variant] || variant; // Default to original if not found
  };

  // Determine which variants to show based on session
  const variantsToShow = session === "FM" ? ["Variant 2"] : allVariants;

  return (
    <div className="relative bg-transparent text-white">
      <FloatingNavbar />
      <div className="flex flex-col items-center p-8">
        <h1 className="text-center text-3xl font-bold text-white opacity-90 mb-8">
          {subject} {year}, {session}
        </h1>
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl">
          {variantsToShow.map((variant) => {
            const abbreviation = getVariantAbbreviation(variant);
            return (
              <Link
                key={variant}
                href={`/past-papers/${subject}/${year}/${session}/${abbreviation}`}
                className="group"
              >
                <Card className="transform group-hover:scale-110 hover:bg-gray-800 shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="text-lg text-center">
                      <span className="font-bold text-2xl">{variant}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
