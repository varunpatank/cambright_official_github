// v0.0.01 salah

import { FaLocationArrow } from "react-icons/fa6";
import MagicButton from "./MagicButton";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import Image from "next/image";
import {
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  Home,
  Heart,
} from "lucide-react";
import { FaMouse } from "react-icons/fa";
import { BackgroundBeams } from "./ui/background-beams";
import { StarsBackground } from "./ui/shooting-stars";
import { Banner } from "./banner";
import { AnimatedCounter } from "./ui/AnimatedCounter";

interface HeroProps {
  showThem?: boolean | true;
}
const Hero = ({ showThem }: HeroProps) => {
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
    <div className="min-h-screen flex flex-col justify-start pt-24 relative">
      <div
        className="h-screen w-full bg-grid-white/[0.03]
        absolute top-0 left-0 flex items-center justify-center"
      >
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center
          bg-n-8 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white)]"
        />
        <div
          className="absolute"
          style={{ top: "5%", left: "10%", transform: "rotate(25deg)" }}
        >
          <GraduationCap
            size={24}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "15%", left: "30%", transform: "rotate(-15deg)" }}
        >
          <GraduationCap
            size={24}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "8%", left: "50%", transform: "rotate(45deg)" }}
        >
          <GraduationCap
            size={24}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "10%", left: "70%", transform: "rotate(-30deg)" }}
        >
          <GraduationCap
            size={24}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "15%", left: "90%", transform: "rotate(60deg)" }}
        >
          <GraduationCap
            size={24}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "20%", left: "5%", transform: "rotate(-45deg)" }}
        >
          <GraduationCap
            size={24}
            color="currentColor"
            className="opacity-80"
          />
        </div>
        <div
          className="absolute"
          style={{ top: "18%", left: "80%", transform: "rotate(30deg)" }}
        >
          <GraduationCap
            size={24}
            color="currentColor"
            className="opacity-80"
          />
        </div>
      </div>
      <StarsBackground />
      <BackgroundBeams />

      <div className="flex justify-center relative z-10 pt-4 pb-6">
        <div className="max-w-[92vw] md:max-w-3xl lg:max-w-[65vw] flex flex-col items-center justify-center">
          {/* Tight group: logo → tagline → description → button */}
          <div className="flex flex-col items-center gap-0.5 w-full">
            <Image src={"/logo-clean.png"} alt="CamBright" height={150} width={640} className="object-contain drop-shadow-[0_0_80px_rgba(139,92,246,0.5)] w-full max-w-[640px]" />

            <p className="uppercase tracking-[0.3em] text-[11px] text-center text-white/45 font-sora font-semibold">
              CamBright IGCSE LLC
            </p>

            <p className="text-center text-xl md:text-2xl font-bold font-sora text-white/85 leading-snug whitespace-nowrap animate-in fade-in duration-1000" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
              Courses &middot; Past Papers &middot; Flashcards &middot;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-cyan-300">Zero Cost.</span>
            </p>

            <div className="flex flex-row gap-3 mt-1">
              {showThem ? (
                <>
                  <a href="/sign-up">
                    <MagicButton width="60" title="Get Started" icon={<FaLocationArrow />} position="right" />
                  </a>
                  <a href="/sign-in">
                    <MagicButton width="25" title="Sign In" icon={<FaLocationArrow />} position="right" />
                  </a>
                </>
              ) : (
                <a href="/dashboard">
                  <MagicButton width="60" title="Dashboard" icon={<GraduationCap />} position="right" />
                </a>
              )}
            </div>
          </div>

          {/* Gap then stats */}
          <div className="w-full mt-5">
            <div className="w-full bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-6 py-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold text-cyan-400 leading-none">2000+</span>
                  <span className="text-sm text-white/60 font-medium mt-1">Total Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <AnimatedCounter baseValue={156} className="text-4xl md:text-5xl font-bold text-emerald-400 leading-none" />
                  <span className="text-sm text-white/60 font-medium mt-1">Active Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold text-violet-400 leading-none">5+</span>
                  <span className="text-sm text-white/60 font-medium mt-1">Partner Schools</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold text-purple-400 leading-none">100%</span>
                  <span className="text-sm text-white/60 font-medium mt-1">Free</span>
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
