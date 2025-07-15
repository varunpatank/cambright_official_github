// v0.0.01 salah

"use client";

import { navItems } from "@/data";

import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import Approach from "@/components/Approach";
import Experience from "@/components/Experience";
import RecentProjects from "@/components/RecentProjects";
import Typer from "@/components/Typer";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useEffect } from "react";

const Homepage = () => {
  const { user } = useUser();

  const router = useRouter();
  useEffect(() => {
    if (user) {
      // Show the loading overlay for a moment before redirecting
      setTimeout(() => {
        router.push("/dashboard"); // Redirect after delay
      }, 500); // Adjust the delay as needed (500ms = 0.5 second)
    }
  }, [user, router]);

  if (user) {
    return <LoadingOverlay />; // Display loading overlay before redirect
  }
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <Hero showThem={true} />
        <Typer />
        <Grid />
        <RecentProjects />
        <Experience />
        <Approach />
        <Footer />
      </div>
    </main>
  );
};

export default Homepage;
