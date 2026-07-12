"use client";

import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Mail, Volume2, VolumeX, Users, ArrowRight, FileText, Trophy, Brain, BookOpen } from "lucide-react";
import Hero from "@/components/Hero";

const FEATURE_CARDS = [
  { title: "Past Papers", desc: "Every session, every year.", href: "/past-papers", icon: FileText, color: "#38bdf8" },
  { title: "Leaderboard", desc: "See where you rank.", href: "/leaderboard", icon: Trophy, color: "#facc15" },
  { title: "Quizzer", desc: "Practice with instant feedback.", href: "/quizzer", icon: Brain, color: "#34d399" },
  { title: "Revision Notes", desc: "Concise notes, every topic.", href: "/search-notes", icon: BookOpen, color: "#f472b6" },
];

function ExploreCards({ keyPrefix }: { keyPrefix: string }) {
  return (
    <>
      <Link
        href="/tutoring-program"
        className="group relative flex shrink-0 flex-col overflow-hidden rounded-3xl border border-violet-400/20 bg-black/30 backdrop-blur-sm transition hover:border-violet-400/40"
        style={{ width: "320px", boxShadow: "0 0 40px rgba(139,92,246,0.1)" }}
      >
        <div className="relative h-44 w-full overflow-hidden">
          <Image src="/tutor.png" alt="CamBright Tutors" fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">Our Tutors</span>
            <h3 className="mt-2 text-xl font-black leading-snug text-white">World-class tutors. <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Zero cost.</span></h3>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-violet-300">Browse Courses <ArrowRight className="h-4 w-4" /></span>
        </div>
      </Link>

      <a
        href="mailto:blazerrryt@gmail.com?subject=Tutor%20Application%20%E2%80%94%20CamBright"
        className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-amber-400/20 bg-black/30 backdrop-blur-sm p-6 transition hover:border-amber-400/40"
        style={{ width: "320px", boxShadow: "0 0 40px rgba(251,191,36,0.08)" }}
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Hiring Tutors</span>
          </div>
          <h3 className="mt-4 text-xl font-extrabold leading-tight text-white">Join our mission. <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Teach thousands.</span></h3>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
            <Users className="h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm text-white/60"><span className="font-bold text-white">2,000+</span> students will see your course</p>
          </div>
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-amber-300"><Mail className="h-4 w-4" /> Email Us</span>
      </a>

      {FEATURE_CARDS.map((f) => (
        <Link
          key={`${keyPrefix}-${f.href}`}
          href={f.href}
          className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-3xl border bg-black/30 backdrop-blur-sm p-6 transition"
          style={{ width: "260px", borderColor: `${f.color}33`, boxShadow: `0 0 30px ${f.color}14` }}
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}aa)` }}>
              <f.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-xl font-black text-white">{f.title}</h3>
            <p className="mt-1.5 text-sm text-white/50">{f.desc}</p>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: f.color }}>Explore <ArrowRight className="h-4 w-4" /></span>
        </Link>
      ))}
    </>
  );
}

function IntroVideo({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Start unmuted directly — no toggling needed
    v.play().catch(() => {
      // If browser blocks unmuted autoplay, mute and retry
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  const finish = () => {
    setFading(true);
    setTimeout(onDone, 900);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999, background: "#000",
      opacity: fading ? 0 : 1,
      transition: fading ? "opacity 0.9s ease" : "none",
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        preload="auto"
        onEnded={finish}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        src="/intro.mp4"
      />

      {/* vignette only */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)", zIndex: 1, pointerEvents: "none" }} />

      {/* skip button */}
      <div style={{ position: "absolute", bottom: 10, right: 28, zIndex: 10 }}>
        <button
          onClick={finish}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "7px 18px", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}
        >
          Skip
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useUser();
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    // Only play once per browser — checked client-side after mount to avoid a hydration mismatch
    if (localStorage.getItem("cb_intro_played")) {
      setIntroDone(true);
    }
  }, []);

  const handleIntroDone = () => {
    localStorage.setItem("cb_intro_played", "1");
    setIntroDone(true);
  };

  return (
    <>
      {!introDone && <IntroVideo onDone={handleIntroDone} />}

      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-6xl px-4 pb-12 md:px-6">

          <Hero showThem={!user} />

          {/* Auto-scrolling marquee of feature cards — pauses on hover so cards are still clickable */}
          <section className="mt-8 md:mt-10">
            <h2 className="mb-4 px-1 text-sm font-bold uppercase tracking-widest text-white/40">Explore CamBright</h2>
            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_4%,white_96%,transparent)]">
              <div
                className="flex w-max gap-4 animate-scroll will-change-transform hover:[animation-play-state:paused]"
                style={{ ["--animation-duration" as string]: "50s" } as CSSProperties}
              >
                <ExploreCards keyPrefix="a" />
                <ExploreCards keyPrefix="b" />
              </div>
            </div>
          </section>

          <footer className="mt-6 lg:mt-10 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo-clean.png" alt="CamBright" width={80} height={22} className="opacity-60" />
              <span className="text-xs text-white/30">v2.0</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-white/50">
              {[["Revision Notes","/search-notes"],["Quizzer","/quizzer"],["Past Papers","/past-papers"],["Leaderboard","/leaderboard"],["Tutoring","/tutoring-program"]].map(([label,href]) => (
                <Link key={href} href={href} className="transition hover:text-white">{label}</Link>
              ))}
            </div>
            <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} CamBright &mdash; 100% Free</p>
          </footer>
        </div>
      </main>
    </>
  );
}
