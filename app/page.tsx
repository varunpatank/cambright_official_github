"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { navItems } from "@/data";
import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import Experience from "@/components/Experience";
import RecentProjects from "@/components/RecentProjects";
import HorizontalFeatures from "@/components/HorizontalFeatures";

export default function RootPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after Clerk has loaded
    if (isLoaded && user) {
      // If user is signed in, redirect to dashboard
      router.push("/dashboard");
    }
  }, [user, isLoaded, router]);

  // Show landing page for unauthenticated users
  if (!isLoaded) {
    // Show loading state while Clerk is loading
    return (
      <div className="min-h-screen bg-black-100 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // User is authenticated, but still show loading while redirecting
    return (
      <div className="min-h-screen bg-black-100 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <Hero showThem={true} />
        <HorizontalFeatures />
        <Grid />
        <RecentProjects />
        <Experience />
        <Footer signed={false} />
      </div>
    </main>
  );
}
