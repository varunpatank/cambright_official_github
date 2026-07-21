// v0.0.01 salah

"use client";

import { useEffect, useState } from "react";
import MagicButton from "./MagicButton";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import Image from "next/image";
import {
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  Home,
  Heart,
  Rocket,
} from "lucide-react";
import { FaMouse } from "react-icons/fa";
import { BackgroundBeams } from "./ui/background-beams";
import { StarsBackground } from "./ui/shooting-stars";
import { Banner } from "./banner";

interface HeroProps {
  onLaunch: () => void;
}

// Only "Active Users" is fetched dynamically — from the same Clerk-backed
// query the leaderboard page uses (see lib/clerk-stats.ts), via this public,
// unauthenticated endpoint. "Total Users" is a static marketing figure, not
// pulled live.
function useActiveUsers(): number | null {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/community-stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setActiveUsers(typeof data.activeUsers === "number" ? data.activeUsers : null);
      } catch {
        // Keep whatever we last had (or the loading state) rather than
        // falling back to a made-up number — the next interval retries.
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return activeUsers;
}

const Hero = ({ onLaunch }: HeroProps) => {
  const activeUsers = useActiveUsers();

  const scrollToNextSection = () => {
    const nextSection = document.querySelector("#typer") as HTMLElement;
    if (nextSection) {
      window.scrollTo({
        top: nextSection.offsetTop - 50,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative overflow-hidden flex flex-col justify-center min-h-screen pt-24 pb-10 sm:pt-28 md:pt-32">
      <div
        className="hidden md:flex h-screen w-full bg-grid-white/[0.03]
        absolute top-0 left-0 items-center justify-center"
      >
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center
          bg-n-8 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white)]"
        />
        <div
          className="absolute"
          style={{ top: "64px", left: "10%", transform: "rotate(25deg)" }}
        >
          <GraduationCap
            size={26}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "84px", left: "27%", transform: "rotate(-15deg)" }}
        >
          <GraduationCap
            size={26}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "52px", left: "50%", transform: "rotate(45deg)" }}
        >
          <GraduationCap
            size={26}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "76px", left: "73%", transform: "rotate(-30deg)" }}
        >
          <GraduationCap
            size={26}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "92px", left: "90%", transform: "rotate(60deg)" }}
        >
          <GraduationCap
            size={26}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "100px", left: "5%", transform: "rotate(-45deg)" }}
        >
          <GraduationCap
            size={26}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "70px", left: "82%", transform: "rotate(30deg)" }}
        >
          <GraduationCap
            size={26}
            color="currentColor"
            className="opacity-80"
          />
        </div>
      </div>
      <StarsBackground />
      <BackgroundBeams />

      <div className="flex justify-center relative z-10 w-full">
        <div className="w-full max-w-[92vw] md:max-w-4xl flex flex-col items-center justify-center">
          {/* Tight group: logo → tagline → description → button */}
          <div className="flex flex-col items-center w-full">
            <Image src={"/logo-clean.png"} alt="CamBright" height={150} width={640} className="object-contain drop-shadow-[0_0_90px_rgba(139,92,246,0.5)] w-full max-w-[420px] sm:max-w-[500px] md:max-w-[640px]" />

            <p className="uppercase tracking-[0.3em] text-xs text-center text-white/50 font-sora font-semibold -mt-2">
              CamBright IGCSE LLC
            </p>

            <p className="text-center text-base sm:text-xl md:text-2xl font-bold font-sora text-white/85 leading-snug whitespace-normal sm:whitespace-nowrap mt-2 px-4 sm:px-0 animate-in fade-in duration-1000" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
              Courses &middot; Past Papers &middot; Flashcards &middot;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-cyan-300">Zero Cost.</span>
            </p>

            <p className="text-center text-xs sm:text-sm font-semibold text-white/45 mt-2 px-4 sm:px-0 animate-in fade-in duration-1000" style={{ animationDelay: "450ms", animationFillMode: "both" }}>
              Built STEM-first — Maths, Physics, Chemistry, Biology, Computer Science{" "}
              <span className="text-white/30">&mdash; and more subjects besides.</span>
            </p>

            <div className="flex flex-row justify-center mt-4 mb-2 w-full max-w-sm sm:max-w-none sm:w-auto px-6 sm:px-0">
              <div className="scale-100 sm:scale-110">
                <MagicButton width="56" title="Launch" icon={<Rocket className="h-5 w-5" />} position="right" handleClick={onLaunch} otherClasses="text-sm sm:text-base tracking-wide" />
              </div>
            </div>
          </div>

          {/* Gap then stats */}
          <div className="w-full mt-8 md:mt-12">
            <div className="w-full bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl px-4 py-5 sm:px-6 sm:py-5">
              <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-center sm:grid-cols-4 sm:gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-cyan-400 leading-none">2,300+</span>
                  <span className="text-xs sm:text-sm text-white/60 font-medium mt-2">Total Users</span>
                </div>
                <div className="flex flex-col items-center">
                  {activeUsers !== null ? (
                    <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-emerald-400 leading-none">
                      {activeUsers.toLocaleString()}
                    </span>
                  ) : (
                    <span className="flex h-[1.2em] items-center py-1 sm:py-1.5" role="status" aria-label="Loading active users">
                      <span className="h-5 w-5 sm:h-7 sm:w-7 rounded-full border-2 border-emerald-400/25 border-t-emerald-400 animate-spin" />
                    </span>
                  )}
                  <span className="text-xs sm:text-sm text-white/60 font-medium mt-2">Active Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-violet-400 leading-none">5+</span>
                  <span className="text-xs sm:text-sm text-white/60 font-medium mt-2">Partner Schools</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-bold text-purple-400 leading-none">100%</span>
                  <span className="text-xs sm:text-sm text-white/60 font-medium mt-2">Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
