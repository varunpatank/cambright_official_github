"use client";

import { useUser } from "@clerk/nextjs";
import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import Experience from "@/components/Experience";
import RecentProjects from "@/components/RecentProjects";
import HorizontalFeatures from "@/components/HorizontalFeatures";

const HomePage = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black-100 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full -mt-4 md:-mt-6">
        <Hero showThem={!user} />
        <HorizontalFeatures />
        <Grid />
        <RecentProjects />
        <Experience />
        <Footer signed={!!user} />
      </div>
    </main>
  );
};

export default HomePage;
