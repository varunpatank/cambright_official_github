// v0.0.01 salah

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
import { AnimatedCounter } from "./ui/AnimatedCounter";

const CAP_ROTATIONS = [25, -15, 45, -30, 60, -45, 30, 15, -20, 35, -35, 20, 10, -50, 40, -10, 55, -25, 5, 65];

interface HeroProps {
  onLaunch: () => void;
}
const Hero = ({ onLaunch }: HeroProps) => {
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
            <Image src={"/logo-clean.png"} alt="CamBright" height={180} width={768} className="object-contain drop-shadow-[0_0_90px_rgba(139,92,246,0.5)] w-full max-w-[500px] sm:max-w-[600px] md:max-w-[768px]" />

            <p className="uppercase tracking-[0.3em] text-sm text-center text-white/50 font-sora font-semibold -mt-2">
              CamBright IGCSE LLC
            </p>

            <p className="text-center text-lg sm:text-2xl md:text-3xl font-bold font-sora text-white/85 leading-snug whitespace-normal sm:whitespace-nowrap mt-2 px-4 sm:px-0 animate-in fade-in duration-1000" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
              Courses &middot; Past Papers &middot; Flashcards &middot;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-cyan-300">Zero Cost.</span>
            </p>

            <div className="flex flex-row justify-center mt-5 mb-2 w-full max-w-sm sm:max-w-none sm:w-auto px-6 sm:px-0">
              <div className="scale-110 sm:scale-125">
                <MagicButton width="56" title="Launch" icon={<Rocket className="h-5 w-5" />} position="right" handleClick={onLaunch} otherClasses="text-base sm:text-lg tracking-wide" />
              </div>
            </div>
          </div>

          {/* Gap then stats */}
          <div className="w-full mt-10 md:mt-16">
            <div className="w-full bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl px-4 py-6 sm:px-8 sm:py-7">
              <div className="grid grid-cols-2 gap-y-6 gap-x-2 text-center sm:grid-cols-4 sm:gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl md:text-6xl font-bold text-cyan-400 leading-none">2000+</span>
                  <span className="text-xs sm:text-base text-white/60 font-medium mt-2">Total Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <AnimatedCounter baseValue={156} className="text-3xl sm:text-5xl md:text-6xl font-bold text-emerald-400 leading-none" />
                  <span className="text-xs sm:text-base text-white/60 font-medium mt-2">Active Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl md:text-6xl font-bold text-violet-400 leading-none">5+</span>
                  <span className="text-xs sm:text-base text-white/60 font-medium mt-2">Partner Schools</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-5xl md:text-6xl font-bold text-purple-400 leading-none">100%</span>
                  <span className="text-xs sm:text-base text-white/60 font-medium mt-2">Free</span>
                </div>
              </div>
            </div>

            {/* Static row of graduation caps — no animation */}
            <div className="relative mt-5 md:mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
              <div className="flex items-center justify-center gap-6 sm:gap-10">
                {CAP_ROTATIONS.map((deg, i) => (
                  <GraduationCap
                    key={i}
                    size={22}
                    color="currentColor"
                    className="shrink-0 text-white/25"
                    style={{ transform: `rotate(${deg}deg)` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
