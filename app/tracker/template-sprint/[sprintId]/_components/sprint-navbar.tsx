// SprintNavbar.tsx
"use client"; // Client-side component for handling UI

import React, { useState } from "react";
import { Sprint } from "@prisma/client";
import { SprintTitleForm } from "./sprint-title-form";
import { SprintOptions } from "./sprint-options";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Use the useRouter hook for client-side routing
import { useAuth } from "@clerk/nextjs"; // Make sure useAuth works client-side

interface SprintNavbarProps {
  data: Sprint;
}

export const SprintNavbar = ({ data }: SprintNavbarProps) => {
  const [loading, setLoading] = useState(false);
  const { orgId } = useAuth(); // useAuth hook on client-side to get organization ID
  const router = useRouter();

  const handleGrabClick = async () => {
    if (!orgId) {
      alert("User is not authenticated or organization not found.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/grab-sprint", {
        method: "POST", // Ensure this is POST
        headers: {
          "Content-Type": "application/json", // Ensure this header is set to JSON
        },
        body: JSON.stringify({ sprintId: data.id }), // Send the sprint ID in the body
      });

      if (!response.ok) {
        const result = await response.json();
        console.error("API Response Error:", result);
        alert(result.error || "Failed to grab the sprint");
        return;
      }

      const result = await response.json();
      if (result.sprintId) {
        router.push(`/tracker/sprint/${result.sprintId}`);
      }
    } catch (error) {
      console.error("Error grabbing sprint:", error);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-14 z-[40] bg-black/50 fixed top-18 flex items-center px-6 gap-x-4 text-white">
      <Link href={`/tracker/group/${orgId}`}>
        <ArrowLeft className="text-muted-foreground hover:text-white transition-all" />
      </Link>

      <SprintTitleForm data={data} can={data.orgId === orgId} />

      {data.orgId === orgId ? (
        <div className="ml-auto ">
          <SprintOptions id={data.id} />
        </div>
      ) : (
        <div className="ml-auto ">
          <Button
            id="add_sprinter"
            variant={"tert"}
            className="w-32"
            onClick={handleGrabClick}
            disabled={loading}
          >
            {loading ? "Grabbing..." : "Grab"}
          </Button>
        </div>
      )}
    </div>
  );
};
