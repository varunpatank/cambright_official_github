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
    <div className="pb-10 pt-32 relative">
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

      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <Image src={"/logo.png"} alt="logo" height={400} width={400} />

          <p className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-80">
            IGCSE Excellence Made Simple
          </p>

          <div className="mt-2">
            <TextGenerateEffect
              className="text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl"
              words="Welcome! We are a 501c3 non-profit that helps students and teachers ace IGCSEs with free courses, resources, and school chapters across the globe."
            />
          </div>

          <div className="flex flex-col items-center space-y-4 mt-2">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8 ">
              {showThem ? (
                <>
                  <a href="/sign-up">
                    <MagicButton
                      width="60"
                      title="Get Started"
                      icon={<FaLocationArrow />}
                      position="right"
                    />
                  </a>
                  <a href="/sign-in">
                    <MagicButton
                      width="25"
                      title="Sign In"
                      icon={<FaLocationArrow />}
                      position="right"
                    />
                  </a>
                </>
              ) : (
                <a href="/dashboard">
                  <MagicButton
                    width="60"
                    title="Dashboard"
                    icon={<GraduationCap />}
                    position="right"
                  />
                </a>
              )}
            </div>

            {/* Statistics Box */}
            <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-2">
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-cyan-400 mb-1">2000+</span>
                  <span className="text-sm text-white font-medium">Total Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <AnimatedCounter 
                    baseValue={156} 
                    className="text-3xl font-bold text-emerald-400 mb-1"
                  />
                  <span className="text-sm text-white font-medium">Active Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-violet-400 mb-1">5+</span>
                  <span className="text-sm text-white font-medium">Schools</span>
                </div>
              </div>
            </div>
            <button
              onClick={scrollToNextSection}
              className="flex flex-col items-center justify-center p-4 bg-slate-800 opacity-70 text-white rounded-full shadow-lg backdrop-blur-md hover:bg-opacity-60 transition-all mt-2 mb-2 animate-pulse"
              aria-label="Scroll Down"
            >
              <FaMouse className="text-xl mb-1" />
              <ChevronDown className="text-xl mt-1 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
