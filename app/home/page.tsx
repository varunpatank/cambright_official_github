"use client";

import { navItems } from "@/data";
import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import Approach from "@/components/Approach";
import Experience from "@/components/Experience";
import RecentProjects from "@/components/RecentProjects";
import Typer from "@/components/Typer";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const Homepage = () => {
  const [showed, setShowed] = useState(false);
  const { user } = useUser();

  // Use useEffect to update the state only after the user data has been loaded
  useEffect(() => {
    if (!user) {
      setShowed(true);
    }
  }, [user]); // Only run the effect when the `user` value changes

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <Hero showThem={showed} />
        <Typer />
        <Grid />
        <RecentProjects />
        <Experience />
        <Approach />
        <Footer signed={!showed} />
      </div>
    </main>
  );
};

export default Homepage;
